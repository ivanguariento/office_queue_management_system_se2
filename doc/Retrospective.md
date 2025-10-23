TEMPLATE FOR RETROSPECTIVE (Team ##)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done 
- Total points committed vs. done 
- Nr of hours planned vs. spent (as a team)

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _Uncategorized_   |  10       |       |      30h 25m      |  28h 40m            |
| 1      |    8     |  1      |       5h 45m     |      8h 15m       |  
| 2 (commited)    |    4     |  3     |       15h     |      15h        |  

> story `Uncategorized` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation |   2h 19m   |    2h 50m   | 
| Actual     |  2h 13m    |   2h 35m    |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = -0.009$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = 0.245 $$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 4h 30m
  - Total hours spent: 5h
  - Nr of automated unit test cases : 48
  - Coverage: 64.5 (stmts), 46.51 (branch), 47.19 (funcs), 65.32 (lines)
- E2E testing:
  - Total hours estimated: 8h
  - Total hours spent: 4h
  - Nr of test cases: 12
- Code review 
  - Total hours estimated : 1h
  - Total hours spent : 1h
  


## ASSESSMENT

- What did go wrong in the sprint?

  - Bad organization: several problem with Git (from branch synchronization to merge conflict)
  - Misunderstanding of finish story meaning

- What caused your errors in estimation (if any)?
  - Lack of experience in agile methodology
  - First time working together

- What lessons did you learn (both positive and negative) in this sprint?
  - To correctly split the work (e.g. Git)
  - To assign the correct time for each task

- Which improvement goals set in the previous retrospective were you able to achieve? 
  -No previous retrospective
  
- Which ones you were not able to achieve? Why?
  -No previous retrospective

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > Improve team organization: task assignment, more verbose task definition, increase the scrum meetings, more team communication
  >Improve Git usage and project skeleton definition

- One thing you are proud of as a Team!!

  >We all like gianduiotti
  >We are nice and funny to each other
  >We are improving our english
