# Alcohol — Recovery Model

## Summary

- **Category**: depressant
- **Primary systems affected**: hepatic, nervous (central), cardiovascular,
  digestive, endocrine.
- **Characteristic feature**: the liver is the organ most directly and
  measurably affected, with well-documented regenerative capacity under
  sustained abstinence. Neuroadaptive changes in reward circuits and
  cognitive structures recover on longer timescales and with more
  interindividual variability.

## Damage profiles

| Organ | maxSeverity | confidence | Source |
|---|---|---|---|
| liver | 85 | high | Lieber (2004), hepatic steatosis and early fibrosis in chronic alcohol use. [VERIFIED — classic review] |
| brain-prefrontal-cortex | 70 | high | Sullivan & Pfefferbaum (2005), neurocircuitry of alcoholism, structural changes. [VERIFIED] |
| brain-hippocampus | 65 | high | Agartz et al. (1999), hippocampal volume reduction in alcoholism. [VERIFIED] |
| brain-vta | 60 | medium | Koob & Volkow (2016), neurobiology of addiction, reward system adaptation. [VERIFIED] |
| brain-nucleus-accumbens | 60 | medium | Koob & Volkow (2016), as above. [VERIFIED] |
| heart | 55 | medium | Piano (2017), alcoholic cardiomyopathy. [NEEDS-VERIFICATION — DOI: TBD] |
| stomach | 50 | high | Bode & Bode (1997), alcohol and gastric mucosa. [NEEDS-VERIFICATION — DOI: TBD] |
| pancreas | 60 | high | Apte et al. (2010), alcoholic pancreatitis mechanisms. [NEEDS-VERIFICATION — DOI: TBD] |

## Recovery curves

| Organ | shape | daysTo95Recovery | recoveryCeiling | confidence | Source |
|---|---|---|---|---|---|
| liver | logarithmic | 90 | 0.95 | high | Lieber (2004); early steatosis reverses in 2-6 weeks, mild fibrosis partially reversible over months. [VERIFIED] |
| brain-prefrontal-cortex | sigmoidal | 365 | 0.85 | medium | Pfefferbaum et al. (1995), gray matter recovery in abstinent alcoholics over months. [VERIFIED] |
| brain-hippocampus | sigmoidal | 540 | 0.80 | medium | Agartz et al. (2003), partial hippocampal volume recovery in long-term abstinence. [NEEDS-VERIFICATION — DOI: TBD] |
| brain-vta | sigmoidal | 180 | 0.90 | medium | Volkow et al. (2007), dopamine D2 receptor recovery in abstinent subjects. [VERIFIED] |
| brain-nucleus-accumbens | sigmoidal | 180 | 0.90 | medium | Volkow et al. (2007), as above. [VERIFIED] |
| heart | logarithmic | 365 | 0.85 | medium | Piano (2017). [NEEDS-VERIFICATION] |
| stomach | logarithmic | 60 | 1.00 | high | Gastric mucosa regenerates rapidly; complete recovery typical without chronic gastritis. [NEEDS-VERIFICATION — review article needed] |
| pancreas | logarithmic | 180 | 0.75 | medium | Apte et al. (2010); acute pancreatitis resolves but chronic changes may persist. [NEEDS-VERIFICATION] |

## Achievements

| ID | Tier | Organ | Threshold | Title | Physiological description |
|---|---|---|---|---|---|
| alcohol-liver-bronze | bronze | liver | 25% | First signs of hepatic recovery | Hepatic steatosis begins reversing within the first two weeks of abstinence. Lipid deposits are metabolized and hepatocyte function improves measurably. |
| alcohol-liver-silver | silver | liver | 50% | Liver function restored | Transaminase levels (ALT, AST) approach normal ranges. Liver fat content is substantially reduced. |
| alcohol-liver-gold | gold | liver | 80% | Hepatic regeneration nearly complete | The liver has regenerated most of its functional tissue. Fibrosis, if mild, has partially reversed. |
| alcohol-prefrontal-silver | silver | brain-prefrontal-cortex | 50% | Cognitive control recovering | Gray matter volume in the prefrontal cortex is increasing. Executive function, impulse control, and decision-making improve. |
| alcohol-vta-gold | gold | brain-vta | 80% | Reward system recalibrating | Dopamine receptor density is approaching baseline. Natural rewards begin to feel meaningful again, reducing anhedonia. |

## Validation status

References marked `[NEEDS-VERIFICATION]`:

- Piano (2017), alcoholic cardiomyopathy
- Bode & Bode (1997), alcohol and gastric mucosa
- Apte et al. (2010), alcoholic pancreatitis
- Agartz et al. (2003), hippocampal recovery
- Gastric mucosa recovery timeline — needs specific source

**Action before seed data ships to production**: resolve DOIs and confirm
numeric values against primary sources.