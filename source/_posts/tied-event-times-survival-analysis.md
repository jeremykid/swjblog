---
title: "Tied Event Times in Survival Analysis: Cox, Ranking Losses, and Beyond"
date: 2026-09-07
mathjax: true
categories:
  - Research Notes
tags:
  - Survival Analysis
  - Clinical AI
  - Machine Learning
---

## TL;DR

A **tied event time** occurs when two or more individuals have the same recorded event time, for example two patients both developing heart failure 10 days after discharge.

The main practical lesson is:

> **Tie handling depends on the training objective, not just the model name.**

For a Cox partial-likelihood model, ties create an ambiguity in the risk set and require a rule such as **Breslow**, **Efron**, or **exact partial likelihood**. For pairwise ranking losses, equal event times usually do not provide an ordering constraint. For parametric or discrete-time likelihoods, repeated event times are often ordinary observations rather than a special problem.

In clinical datasets, ties are common when follow-up is recorded in integer days, dates are rounded, or cohorts are large. The safest workflow is therefore to identify the objective being optimized and then verify how the software actually handles equal times.

## 1. What Is a Tie?

Suppose two prediction episodes have

$$
T_A = T_B = 10,\qquad \delta_A=\delta_B=1,
$$

meaning both experience the endpoint on day 10.

This is an **event-time tie**. It is different from:

- two patients receiving the same predicted risk score;
- competing events such as heart failure versus death;
- repeated episodes from the same patient;
- censoring, which determines whether the event time is observed at all.

These distinctions matter because each creates a different statistical problem.

A further edge case is an **event–censor tie**, where one patient has an event and another is censored at the same recorded time. In the usual Cox risk-set convention, a patient censored at time $t$ remains in $R(t)$ for failures at $t$; this effectively places events before censoring at the same recorded time. Evaluation metrics may use different comparability conventions, so event–censor ties should be checked separately rather than treated as ordinary event–event ties.

A useful question is not simply *“Does my dataset contain ties?”* but rather:

> **Does my loss function require a strict ordering between these observations?**

That question determines whether any special treatment is needed.

## 2. Why Ties Are Common in Clinical Data

In theory, survival time can be continuous. In practice, clinical data are often stored at much lower resolution:

- follow-up may be measured in whole days;
- event timestamps may be rounded to dates;
- prediction time may be defined from discharge;
- administrative pipelines may truncate or discretize timestamps;
- large cohorts naturally produce more repeated times.

Thus, two events recorded on day 10 do not necessarily mean that they occurred at exactly the same instant. They may simply be indistinguishable at the available time resolution.

This becomes important for models whose objective depends on the order in which patients leave a risk set.

## 3. Why Cox Models Need a Tie Rule

For a Cox proportional hazards model, let

$$
\eta_i = f(x_i)
$$

be the log-risk score. With a unique event time $T_i$, the partial likelihood compares the patient who experiences the event with everyone still at risk:

$$
\frac{\exp(\eta_i)}
{\sum_{j\in R(T_i)}\exp(\eta_j)}.
$$

Now suppose patients $A$ and $B$ both experience the event on day 10.

The first event should be evaluated using the full risk set. For the second event, however, the first patient should already have left that set. The problem is that the recorded data do not tell us whether $A$ or $B$ occurred first.

That is the Cox tie problem.

### Breslow, Efron, and Exact

Let $D_t$ be the set of $d_t$ events observed at time $t$, and define

$$
S_R=\sum_{j\in R_t}\exp(\eta_j),
\qquad
S_D=\sum_{i\in D_t}\exp(\eta_i).
$$

The three standard approaches in `survival::coxph()` are:

| Method | Basic idea | Cost | Practical use |
|---|---|---:|---|
| **Breslow** | Use the full risk-set denominator for all tied events | Low | Simple approximation; reasonable when ties are sparse |
| **Efron** | Progressively remove fractions of the tied-event risk contribution | Low–moderate | Strong default for ordinary Cox models when ties are present |
| **Exact partial likelihood** | Account for all possible tied-event subsets consistent with the data | High | Small problems with genuinely discrete time and few unique times |

For two tied events, Breslow uses denominators

$$
S_R,\qquad S_R,
$$

whereas Efron uses

$$
S_R,\qquad S_R-\frac{1}{2}S_D.
$$

For $d_t$ tied events, Efron contributes

$$
\ell_t^{\mathrm{Efron}} =
\sum_{i\in D_t}\eta_i
-\sum_{l=0}^{d_t-1}
\log\left(
S_R-\frac{l}{d_t}S_D
\right).
$$

The R `survival` documentation uses Efron as the default for ordinary single-state Cox models and notes that exact partial likelihood can become computationally expensive when many subjects are tied at one time point. A multistate Cox model is an important exception: in `survival` 3.8-11, the default is Breslow because a defensible general extension of Efron is more complicated, and the current Efron implementation is effectively limited to tied transitions of the same type.

Importantly, **“exact” does not mean better prediction**. It means a more exact treatment of the partial likelihood under a particular discrete-time interpretation.

## 4. DeepSurv Is Still a Cox Model

DeepSurv replaces the linear Cox predictor

$$
x^\top\beta
$$

with a neural network

$$
f_\theta(x),
$$

but the objective is still based on the Cox partial likelihood.

Therefore, the tie question does not disappear just because the model is deep.

This leads to an important implementation rule:

> **Never infer the tie method from the label “Cox loss” or “DeepSurv.” Check the actual implementation.**

For example, TorchSurv 0.2.0 exposes `ties_method="efron"` or `"breslow"` for its Cox loss, with Efron as the default. In contrast, the `pycox` 0.3.0 CoxPH loss sorts observations by duration and computes the denominator using a cumulative sum rather than explicitly constructing tied risk sets. Its source does not show a documented Efron or Breslow correction in that loss. From this implementation, equal-duration observations can be inferred to depend on their within-tie ordering; this is an interpretation of the version-pinned source rather than an explicit library claim.

So two neural Cox implementations can optimize slightly different objectives even when both are described as “DeepSurv.”

## 5. Pairwise Ranking Losses Have a Different Tie Problem

A pure ranking objective asks whether one patient should be assigned higher risk than another.

For example, a comparable-pair set may be defined as

$$
\mathcal P =
\{(i,j): T_i<T_j,\ \delta_i=1\}.
$$

If

$$
T_A=10,\qquad T_B=20,
$$

then the observation supports the ordering

$$
\text{risk}(A)>\text{risk}(B).
$$

But if

$$
T_A=T_B=10,
$$

the observed data do not tell us whether $A$ should rank above $B$ or vice versa.

The clean statistical response is therefore usually **not to create a strict pairwise constraint between them**.

This is conceptually different from Efron. Efron approximates an unknown ordering *inside a Cox risk-set likelihood*. A pairwise ranking loss can simply say that an equal-time pair carries no information about which patient should rank first.

### DeepHit

DeepHit is a useful example because its objective combines two components:

$$
\mathcal L =
\mathcal L_{\text{likelihood}}
+
\mathcal L_{\text{ranking}}.
$$

The original paper defines acceptable ranking pairs using a strict time inequality $s_i<s_j$. Equal observed times therefore do not define an ordered acceptable pair for the ranking term.

At the same time, DeepHit models a discrete event-time distribution, so multiple patients occupying the same time bin are perfectly valid observations for its likelihood component.

One model can therefore treat ties differently in different parts of its objective.

### Survival SVM

Survival SVMs provide another ranking example. Conceptually, equal event times do not encode a strict temporal ordering. However, `FastSurvivalSVM` in scikit-survival 0.28.0 resolves ties in survival times before optimization, using `random_state` to make this ordering reproducible. This implementation convention should not be mistaken for temporal information observed in the data.

## 6. Some Models Do Not Need Cox-Style Tie Correction

The simplest way to see this is to compare the training objectives.

| Model family | Typical objective | What does $T_A=T_B$ mean? | Cox-style tie correction? |
|---|---|---|---|
| Cox PH / DeepSurv | Cox partial likelihood | Risk-set departure order is ambiguous | **A tie method must be specified** |
| Pairwise ranking / Survival SVM | Ranking loss | No strict order between equal-time events | **No** |
| DeepHit | Discrete likelihood + ranking | Same bin is valid; ranking pair requires an order | **No** |
| Weibull / parametric AFT | Full survival likelihood | Two ordinary observations at the same time | **No** |
| LogisticHazard / PMF / MTLR | Discrete-time likelihood | Multiple events in one interval are expected | **No** |
| Random Survival Forest | Tree splitting + nonparametric survival estimation | Events can be aggregated at a unique event time | **No Cox-style correction; estimator-specific handling** |

### Weibull and other parametric models

For a Weibull model, an uncensored patient contributes a density term and a censored patient contributes a survival term:

$$
L_i =
f(T_i\mid x_i)^{\delta_i}
S(T_i\mid x_i)^{1-\delta_i}.
$$

If two patients both experience an event at time 10, the likelihood simply contains

$$
f(10\mid x_A)\,f(10\mid x_B).
$$

There is no unknown risk-set departure order to approximate.

### Discrete-time models

For models such as LogisticHazard, PMF, or MTLR, the time axis is represented by intervals or discrete bins. Multiple patients experiencing an event in the same interval are therefore part of the model definition rather than an exceptional case.

This distinction is useful:

> **Repeated event times are observations. They become a special “tie problem” only when the objective needs information that the recorded time resolution does not provide.**

## 7. A Small Clinical Example

Suppose five patients are still at risk immediately before day 10:

$$
R(10)=\{A,B,C,D,E\}.
$$

Patients $A$ and $B$ both experience heart failure on day 10.

### Cox model

The model must evaluate two event contributions while knowing only that both occurred at the same recorded time.

- Breslow keeps the same denominator for both.
- Efron progressively adjusts the denominator.
- Exact partial likelihood sums over the possible tied-event subsets consistent with the observed tie.

### Pairwise ranking model

The data support statements such as

$$
T_A=10<T_C=30
$$

and therefore an ordering between $A$ and $C$.

They do **not** support a strict ordering between $A$ and $B$, because

$$
T_A=T_B.
$$

### Weibull or discrete-time model

Both patients can contribute normally at time 10 or in the same time bin. No Cox-specific tie approximation is required.

The same raw data therefore create three different behaviors because the objectives ask three different questions.

## 8. Training Ties Are Not Evaluation Ties

There is one final source of confusion: the concordance index also contains tie rules.

For Harrell-style concordance, two patients who both experience an event at the same observed time generally do not form an ordered comparable event-event pair. For example, `scikit-survival` 0.28.0 treats equal event times as non-comparable and assigns 0.5 credit when a comparable pair has tied predicted risk scores.

So a paper may need to report two distinct decisions:

1. how tied event times were handled during model fitting; and
2. how tied observed times and tied predicted risks were handled during evaluation.

These should not be conflated.

## 9. Practical Decision Guide

When you encounter many tied event times, ask:

1. **What objective am I optimizing?**  
   Cox partial likelihood, pairwise ranking, full parametric likelihood, discrete likelihood, or something else?

2. **Does that objective require a strict event ordering?**  
   If not, a Cox-style tie correction may be irrelevant.

3. **Is time truly discrete, or merely recorded coarsely?**  
   This affects whether an exact discrete interpretation is scientifically meaningful.

4. **How frequent are the ties?**  
   For Cox models, the difference between approximations matters more as tie multiplicity increases.

5. **What does the software actually implement?**  
   Do not assume that every package using the phrase “Cox loss” is using Efron.

6. **Does the evaluation metric have its own tie convention?**  
   Training-time and evaluation-time ties are separate issues.

For a standard single-event Cox model with ordinary clinical follow-up data, **Efron is a strong default**. For other survival objectives, first determine whether there is actually a tie problem to solve.

## 10. Reporting Recommendation

For a Cox model, a concise Methods sentence is:

> Tied event times were handled using the Efron approximation to the Cox partial likelihood.

For a neural Cox model, it is better to add the implementation:

> The neural risk model was trained using a Cox partial-likelihood objective with Efron handling of tied event times.

For a broader reproducibility statement, report the software package, version, objective, and tie method explicitly.

## Takeaways

The key distinction is not **classical versus deep survival analysis**. It is **what information the loss function requires from the observed event times**.

- Cox models need a rule because tied events make risk-set departure order ambiguous.
- Pairwise ranking objectives should not invent an ordering that the data do not contain.
- Parametric and discrete-time likelihoods can usually accept repeated event times directly.
- Software behavior is part of the statistical method and should be verified and reported.
- Tie handling during training is separate from tie handling in concordance-based evaluation.

Once this distinction is clear, tied event times become much less mysterious.

## References

### Original and classical methods

1. Cox DR. **Regression Models and Life-Tables.** *Journal of the Royal Statistical Society: Series B*. 1972;34(2):187–220.  
   https://doi.org/10.1111/j.2517-6161.1972.tb00899.x

2. Breslow NE. **Covariance Analysis of Censored Survival Data.** *Biometrics*. 1974;30(1):89–99.  
   https://doi.org/10.2307/2529620

3. Efron B. **The Efficiency of Cox's Likelihood Function for Censored Data.** *Journal of the American Statistical Association*. 1977;72(359):557–565.  
   https://doi.org/10.1080/01621459.1977.10480613

4. Therneau TM, Grambsch PM. **Modeling Survival Data: Extending the Cox Model.** Springer; 2000.

5. Katzman JL, Shaham U, Cloninger A, Bates J, Jiang T, Kluger Y. **DeepSurv: personalized treatment recommender system using a Cox proportional hazards deep neural network.** *BMC Medical Research Methodology*. 2018;18:24.  
   https://doi.org/10.1186/s12874-018-0482-1

6. Lee C, Zame WR, Yoon J, van der Schaar M. **DeepHit: A Deep Learning Approach to Survival Analysis With Competing Risks.** *AAAI*. 2018;32(1).  
   https://doi.org/10.1609/aaai.v32i1.11842

7. Ishwaran H, Kogalur UB, Blackstone EH, Lauer MS. **Random Survival Forests.** *The Annals of Applied Statistics*. 2008;2(3):841–860.  
   https://doi.org/10.1214/08-AOAS169

### Software behavior checked for this note

8. R `survival` 3.8-11, `coxph()` documentation. Efron is the default for ordinary single-state Cox models; multistate models default to Breslow.  
   https://stat.ethz.ch/R-manual/R-devel/library/survival/html/coxph.html

9. TorchSurv 0.2.0, Cox loss documentation. Supports `ties_method="efron"` and `"breslow"`; Efron is the default.  
   https://opensource.nibr.com/torchsurv/_autosummary/torchsurv.loss.cox.html

10. `pycox` 0.3.0, CoxPH loss source. The loss sorts by duration and uses a cumulative-sum denominator rather than explicitly constructing tied risk sets.  
    https://github.com/havakv/pycox/blob/v0.3.0/pycox/models/loss.py

11. scikit-survival 0.28.0, `FastSurvivalSVM` and `concordance_index_censored` documentation.  
    https://scikit-survival.readthedocs.io/en/v0.28.0/api/generated/sksurv.svm.FastSurvivalSVM.html  
    https://scikit-survival.readthedocs.io/en/v0.28.0/api/generated/sksurv.metrics.concordance_index_censored.html

*Software behavior and versions were checked on September 7, 2026.*
