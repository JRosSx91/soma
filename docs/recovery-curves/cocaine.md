# Cocaine — Recovery Model

## Summary

- **Category**: stimulant.
- **Primary systems affected**: cardiovascular, nervous (central),
  respiratory (in insufflated and smoked routes), hepatic (when combined
  with alcohol).
- **Characteristic feature**: cocaine exerts its effects primarily through
  blockade of dopamine, norepinephrine, and serotonin reuptake. Chronic use
  produces marked downregulation of dopamine D2 receptors in striatal
  regions, and chronic cardiovascular stress predisposes to structural
  cardiac changes (left ventricular hypertrophy, accelerated atherosclerosis,
  coronary spasm). Unlike alcohol or nicotine, cocaine's acute cardiovascular
  risk is substantial — myocardial infarction can occur at any dose in any
  user. Recovery model represents sustained abstinence in users without
  acute cardiac events; users with prior cocaine-related MI or cardiomyopathy
  have distinct trajectories not captured here.

## Damage profiles

| Organ | maxSeverity | confidence | Source |
|---|---|---|---|
| heart | 85 | high | Schwartz et al. (2010), cardiovascular effects of cocaine. [NEEDS-VERIFICATION — DOI: TBD] |
| brain-vta | 75 | high | Volkow et al. (1993), decreased dopamine D2 receptor availability in cocaine abusers. [VERIFIED — landmark PET study] |
| brain-nucleus-accumbens | 75 | high | Volkow et al. (1993), as above. [VERIFIED] |
| brain-prefrontal-cortex | 65 | high | Goldstein & Volkow (2011), dysfunction of the prefrontal cortex in addiction. [VERIFIED] |
| brain-amygdala | 55 | medium | Ersche et al. (2011), abnormal brain structure in cocaine dependence. [NEEDS-VERIFICATION — DOI: TBD] |
| lungs | 55 | medium | Restrepo et al. (2007), pulmonary complications from cocaine. [NEEDS-VERIFICATION — applies primarily to smoked/crack use] |
| bronchi | 60 | medium | Restrepo et al. (2007), as above. [NEEDS-VERIFICATION] |
| kidneys | 50 | medium | Jaffe & Kimmel (2006), chronic cocaine use and renal function. [NEEDS-VERIFICATION — DOI: TBD] |
| liver | 40 | medium | Higher when combined with alcohol (cocaethylene formation). [NEEDS-VERIFICATION — polysubstance interaction documented separately] |

## Recovery curves

| Organ | shape | daysTo95Recovery | recoveryCeiling | confidence | Source |
|---|---|---|---|---|---|
| brain-vta | sigmoidal | 270 | 0.85 | medium | Volkow et al. (1993, 2002); D2 receptor recovery is slower and less complete than in other substances. Deficits persist at 3-4 months of abstinence. [VERIFIED] |
| brain-nucleus-accumbens | sigmoidal | 270 | 0.85 | medium | Volkow et al. (1993, 2002), as above. [VERIFIED] |
| brain-prefrontal-cortex | sigmoidal | 365 | 0.85 | medium | Goldstein & Volkow (2011); executive function improves over months of abstinence but does not fully normalize in some users. [VERIFIED] |
| brain-amygdala | sigmoidal | 365 | 0.85 | low | Ersche et al. (2011); structural changes partially reversible but literature is limited. [NEEDS-VERIFICATION] |
| heart | logarithmic | 540 | 0.75 | medium | Cardiovascular risk markers (blood pressure, endothelial function) improve within weeks to months. Structural changes (LV hypertrophy, established atherosclerosis) show limited reversibility. Ceiling reflects this. [NEEDS-VERIFICATION] |
| bronchi | logarithmic | 90 | 0.95 | medium | Applies to users who smoked crack cocaine; airway inflammation resolves within weeks to months. [NEEDS-VERIFICATION] |
| lungs | logarithmic | 180 | 0.85 | medium | Pulmonary function improves with cessation in crack users; crack lung (acute pulmonary syndrome) resolves but chronic changes may persist. [NEEDS-VERIFICATION] |
| kidneys | logarithmic | 180 | 0.85 | medium | Renal function improves with cessation when no acute renal injury occurred during use. [NEEDS-VERIFICATION] |
| liver | logarithmic | 90 | 0.95 | medium | Hepatic recovery rapid in absence of coexisting alcohol use. Cocaethylene-related damage follows alcohol hepatic recovery curve. [NEEDS-VERIFICATION] |

## Achievements

| ID | Tier | Organ | Threshold | Title | Physiological description |
|---|---|---|---|---|---|
| cocaine-heart-bronze | bronze | heart | 25% | Blood pressure normalizing | Resting blood pressure and heart rate are returning to baseline. Acute cardiovascular risk from each day of use has been eliminated. |
| cocaine-heart-silver | silver | heart | 50% | Endothelial function recovering | The inner lining of blood vessels is healing. Vasospasm risk is decreasing, and circulation is improving measurably. |
| cocaine-vta-bronze | bronze | brain-vta | 25% | First dopamine rebound | Dopamine D2 receptor density is beginning to recover from the deep downregulation caused by chronic stimulant use. |
| cocaine-vta-silver | silver | brain-vta | 60% | Reward system rebuilding | Substantial recovery of striatal dopamine signaling. Natural rewards — food, music, social connection, exercise — are regaining their motivational salience. |
| cocaine-vta-gold | gold | brain-vta | 85% | Dopaminergic system restored | D2 receptor availability has reached near-baseline levels. The anhedonia characteristic of early abstinence has substantially resolved. |
| cocaine-prefrontal-silver | silver | brain-prefrontal-cortex | 50% | Executive function recovering | Prefrontal cortex activity patterns are normalizing. Impulse control, working memory, and decision-making show sustained improvement. |
| cocaine-prefrontal-gold | gold | brain-prefrontal-cortex | 80% | Cognitive control restored | Executive function has largely normalized. Cue-reactivity and craving intensity are substantially reduced. |

## Validation status

References marked `[NEEDS-VERIFICATION]`:

- Schwartz et al. (2010), cardiovascular effects
- Ersche et al. (2011), structural brain changes
- Restrepo et al. (2007), pulmonary complications
- Jaffe & Kimmel (2006), renal function
- Cocaethylene hepatotoxicity — needs specific source

References marked `[VERIFIED]`:

- Volkow et al. (1993), D2 receptor PET imaging — landmark study,
  widely cited.
- Volkow et al. (2002), D2 recovery in abstinence — follow-up imaging work.
- Goldstein & Volkow (2011), prefrontal dysfunction — highly cited review.

**Action before seed data ships to production**: resolve DOIs and confirm
numeric values. Cocaine literature has strong neuroimaging evidence for
brain effects (Volkow group at NIDA) and solid cardiovascular epidemiology.
Kidney and liver values have thinner evidence bases and may warrant further
review. The `recoveryCeiling` of 0.75 for heart is deliberately conservative
— users with established structural cardiac changes have limited reversibility,
and the model should not overpromise recovery here.