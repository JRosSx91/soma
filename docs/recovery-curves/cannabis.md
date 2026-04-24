# Cannabis — Recovery Model

## Summary

- **Category**: cannabinoid.
- **Primary systems affected**: nervous (central), respiratory (in smoked
  consumption), cardiovascular, endocrine, reproductive.
- **Characteristic feature**: cannabis effects are mediated primarily through
  CB1 receptors, densely expressed in the prefrontal cortex, hippocampus,
  cerebellum, and basal ganglia. Chronic use produces measurable CB1
  downregulation that reverses within weeks of abstinence. Respiratory
  effects apply to smoked cannabis and overlap partially with tobacco-related
  mechanisms but without the same cancer risk profile. Adolescent-onset
  chronic use shows more persistent cognitive effects than adult-onset use;
  this model represents adult-onset chronic use. A separate parameter for
  age-of-onset may be introduced in a future version.

## Damage profiles

| Organ | maxSeverity | confidence | Source |
|---|---|---|---|
| brain-prefrontal-cortex | 50 | medium | Volkow et al. (2016), adverse health effects of marijuana use, NEJM. [NEEDS-VERIFICATION — DOI: TBD] |
| brain-hippocampus | 55 | medium | Lorenzetti et al. (2016), structural MRI findings in cannabis users. [NEEDS-VERIFICATION — DOI: TBD] |
| brain-vta | 45 | medium | Bloomfield et al. (2016), dopamine system in cannabis users. [NEEDS-VERIFICATION — DOI: TBD] |
| brain-nucleus-accumbens | 45 | medium | Bloomfield et al. (2016), as above. [NEEDS-VERIFICATION] |
| brain-amygdala | 40 | medium | Lorenzetti et al. (2016), amygdala volume changes in heavy users. [NEEDS-VERIFICATION] |
| lungs | 50 | medium | Tashkin (2013), effects of marijuana smoking on the lung. [NEEDS-VERIFICATION — DOI: TBD] |
| bronchi | 60 | medium | Tashkin (2013), bronchitis symptoms in chronic cannabis smokers. [NEEDS-VERIFICATION] |
| heart | 40 | low | Richards et al. (2019), cannabis use and cardiovascular health. [NEEDS-VERIFICATION] |
| testes | 30 | low | du Plessis et al. (2015), cannabis and male reproductive function. [NEEDS-VERIFICATION] |
| ovaries | 30 | low | Brents (2016), cannabis and female reproductive function. [NEEDS-VERIFICATION] |

## Recovery curves

| Organ | shape | daysTo95Recovery | recoveryCeiling | confidence | Source |
|---|---|---|---|---|---|
| brain-vta | sigmoidal | 30 | 0.95 | high | Hirvonen et al. (2012), reversible CB1 receptor downregulation in chronic cannabis smokers. Recovery observable within 4 weeks. [VERIFIED — PET imaging study] |
| brain-nucleus-accumbens | sigmoidal | 30 | 0.95 | high | Hirvonen et al. (2012), as above. [VERIFIED] |
| brain-prefrontal-cortex | sigmoidal | 180 | 0.90 | medium | Schuster et al. (2016), cognitive recovery in abstinent cannabis users. [NEEDS-VERIFICATION] |
| brain-hippocampus | sigmoidal | 365 | 0.85 | medium | Lorenzetti et al. (2016); volumetric changes partially reversible over months. [NEEDS-VERIFICATION] |
| brain-amygdala | sigmoidal | 180 | 0.90 | medium | Lorenzetti et al. (2016). [NEEDS-VERIFICATION] |
| bronchi | logarithmic | 90 | 0.95 | medium | Tashkin (2013); chronic bronchitis symptoms largely reversible with cessation. [NEEDS-VERIFICATION] |
| lungs | logarithmic | 180 | 0.90 | medium | Tashkin (2013); unlike tobacco, cannabis smoking shows no clear association with lung cancer or COPD at typical usage levels. Recovery more complete than nicotine. [NEEDS-VERIFICATION] |
| heart | logarithmic | 90 | 1.00 | medium | Cardiovascular effects (tachycardia, transient hypertension) resolve within days to weeks in users without underlying disease. [NEEDS-VERIFICATION] |
| testes | linear | 180 | 0.95 | low | du Plessis et al. (2015); sperm parameters recover within 3-6 months of cessation. [NEEDS-VERIFICATION] |
| ovaries | linear | 180 | 0.95 | low | Brents (2016); hormonal cycle normalization typically within months. [NEEDS-VERIFICATION] |

## Achievements

| ID | Tier | Organ | Threshold | Title | Physiological description |
|---|---|---|---|---|---|
| cannabis-vta-bronze | bronze | brain-vta | 30% | CB1 receptors awakening | Downregulated CB1 receptors in the reward system are beginning to restore density. The brain is regaining sensitivity to its own endocannabinoid signaling. |
| cannabis-vta-silver | silver | brain-vta | 70% | Endocannabinoid system restored | CB1 receptor density has largely normalized. Natural rewards — food, social connection, physical activity — regain their full motivational weight. |
| cannabis-prefrontal-silver | silver | brain-prefrontal-cortex | 50% | Executive function sharpening | Prefrontal cortex activity patterns are normalizing. Working memory, attention, and planning capabilities improve measurably. |
| cannabis-hippocampus-gold | gold | brain-hippocampus | 75% | Memory consolidation restored | Hippocampal structure and function are approaching baseline. Short-term memory encoding and spatial memory show sustained improvement. |
| cannabis-bronchi-silver | silver | bronchi | 60% | Airways clearing | Chronic bronchitis symptoms — cough, sputum production, wheeze — are resolving. Bronchial inflammation markers return toward baseline. |

## Validation status

References marked `[NEEDS-VERIFICATION]`:

- Volkow et al. (2016), NEJM review — likely verifiable, DOI pending
- Lorenzetti et al. (2016), structural MRI
- Bloomfield et al. (2016), dopamine system
- Tashkin (2013), pulmonary effects
- Richards et al. (2019), cardiovascular effects
- du Plessis et al. (2015), male reproductive effects
- Brents (2016), female reproductive effects
- Schuster et al. (2016), cognitive recovery

References marked `[VERIFIED]`:

- Hirvonen et al. (2012), CB1 receptor downregulation reversal — landmark
  PET imaging study, well-established in the literature.

**Action before seed data ships to production**: resolve DOIs and confirm
numeric values. Cannabis literature is an area where study quality varies
widely — prefer meta-analyses and NIDA-affiliated reviews for verification.
Several values for peripheral effects (cardiovascular, reproductive) are
marked `low` confidence because sample sizes in cannabis-specific studies
tend to be smaller and confounded by polysubstance use.