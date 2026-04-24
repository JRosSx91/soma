# Nicotine — Recovery Model

## Summary

- **Category**: nicotine (own category due to distinctive pharmacology).
- **Primary systems affected**: respiratory, cardiovascular, nervous (central),
  integumentary.
- **Characteristic feature**: nicotine is notable for the speed of early
  respiratory and cardiovascular recovery. Bronchial ciliary function begins
  to restore within days, and cardiovascular risk markers improve measurably
  within the first year. Neuroadaptive changes in nicotinic acetylcholine
  receptors (nAChRs) recover on longer timescales. The rapid early wins make
  nicotine a particularly rewarding visualization target for users.

## Damage profiles

| Organ | maxSeverity | confidence | Source |
|---|---|---|---|
| lungs | 80 | high | U.S. Department of Health and Human Services (2014), The Health Consequences of Smoking — 50 Years of Progress. [VERIFIED — Surgeon General's Report] |
| bronchi | 85 | high | USDHHS (2014), ciliary dysfunction and mucus hypersecretion in smokers. [VERIFIED] |
| heart | 70 | high | USDHHS (2014), cardiovascular disease and smoking. [VERIFIED] |
| brain-vta | 55 | high | Benowitz (2010), nicotine addiction, NEJM. [NEEDS-VERIFICATION — DOI: TBD] |
| brain-nucleus-accumbens | 55 | high | Benowitz (2010), as above. [NEEDS-VERIFICATION] |
| brain-prefrontal-cortex | 40 | medium | Durazzo et al. (2010), chronic smoking and brain structure. [NEEDS-VERIFICATION — DOI: TBD] |
| skin | 50 | medium | Morita (2007), tobacco smoke causes premature skin aging. [NEEDS-VERIFICATION — DOI: TBD] |

## Recovery curves

| Organ | shape | daysTo95Recovery | recoveryCeiling | confidence | Source |
|---|---|---|---|---|---|
| bronchi | logarithmic | 270 | 0.90 | high | USDHHS (2014); ciliary motility restored within 2-3 weeks, mucosal clearance normalizes over 9 months. [VERIFIED] |
| lungs | logarithmic | 365 | 0.75 | high | USDHHS (2014); FEV1 decline slows to non-smoker rate, but lost capacity only partially recovers. Ceiling below 1.0 reflects irreversible component in long-term smokers. [VERIFIED] |
| heart | sigmoidal | 365 | 0.90 | high | USDHHS (2014); cardiovascular event risk halves in 1 year, approaches non-smoker baseline over 10-15 years. Curve represents first-year recovery. [VERIFIED] |
| brain-vta | sigmoidal | 90 | 0.95 | high | Cosgrove et al. (2009), nAChR upregulation reverses within weeks to months of abstinence. [NEEDS-VERIFICATION — DOI: TBD] |
| brain-nucleus-accumbens | sigmoidal | 90 | 0.95 | high | Cosgrove et al. (2009), as above. [NEEDS-VERIFICATION] |
| brain-prefrontal-cortex | sigmoidal | 540 | 0.85 | medium | Durazzo et al. (2014), partial recovery of cortical thickness in long-term abstinent smokers. [NEEDS-VERIFICATION] |
| skin | logarithmic | 180 | 0.80 | medium | Microcirculation and collagen metabolism improve within months; photoaging and deep wrinkles partially irreversible. [NEEDS-VERIFICATION — review source needed] |

## Achievements

| ID | Tier | Organ | Threshold | Title | Physiological description |
|---|---|---|---|---|---|
| nicotine-bronchi-bronze | bronze | bronchi | 20% | Cilia awakening | Within 72 hours of cessation, bronchial cilia begin restoring their rhythmic motion. The mucociliary escalator starts clearing accumulated tar and particulates. |
| nicotine-bronchi-silver | silver | bronchi | 60% | Breathing easier | Bronchial mucosa has largely recovered. Chronic cough reduces, exercise tolerance noticeably improves. |
| nicotine-lungs-silver | silver | lungs | 50% | Pulmonary capacity rebounding | Forced expiratory volume (FEV1) is improving. The rate of age-related lung function decline has normalized to that of a non-smoker. |
| nicotine-heart-gold | gold | heart | 70% | Cardiovascular risk halved | The risk of myocardial infarction has dropped dramatically. Platelet aggregation, endothelial function, and lipid profiles are approaching non-smoker ranges. |
| nicotine-vta-silver | silver | brain-vta | 60% | Nicotinic receptors recalibrating | Upregulated nicotinic acetylcholine receptors are returning to baseline density. Cravings intensity and frequency are decreasing measurably. |
| nicotine-vta-gold | gold | brain-vta | 85% | Reward system restored | Dopamine release in response to natural rewards is normalizing. The brain no longer depends on nicotine to trigger pleasure responses. |

## Validation status

References marked `[NEEDS-VERIFICATION]`:

- Benowitz (2010), NEJM review — likely verifiable, DOI pending
- Durazzo et al. (2010, 2014), smoking and brain structure
- Cosgrove et al. (2009), nAChR imaging studies
- Morita (2007), skin aging and tobacco
- Skin recovery timeline — needs specific dermatology source

**Action before seed data ships to production**: resolve DOIs and confirm
numeric values against primary sources. Surgeon General's Report (2014)
citations are high-confidence and publicly accessible at
https://www.ncbi.nlm.nih.gov/books/NBK179276/.