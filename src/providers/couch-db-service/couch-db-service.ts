import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {GlobalFunctionsServiceProvider} from "../global-functions-service/global-functions-service";


@Injectable()
export class CouchDbServiceProvider {

  private baseUrl = 'https://tractdb.org/api';
  private activeUserGoals = {}; // only ONE entry is active at a given time; "goals" lists all current goals
  private trackedData = [];
  private options = {withCredentials: true};

  constructor(public http: HttpClient, private globalFunctions: GlobalFunctionsServiceProvider) {
  }

  getCurrentBreak(){
    // todo: pull from db, make sure it's current
    return undefined;
    // return {
    //   "reasonForBreak": "I want to",
    //   "notifyDate": "2020-02-28",
    //   "started": "2019-02-27T01:07:42.495Z"
    // }
  }

  updateBreak(currentBreak){
    // todo: push to db
    console.log(currentBreak);
  }

  setBreak(newBreak){
    //todo: push to db
    console.log(newBreak);
  }


  login(credentials) {
    // log the user in based on the credentials
    return this.http.post(this.baseUrl + '/login', JSON.stringify(credentials), this.options);
  }

  userLoggedIn() {
    // see if we're logged in; response gives account
    return this.http.get(this.baseUrl + '/authenticated', this.options);
  }

  getQuickTrackers() {
    // todo: database, of course
    let defaultTrackers = {
      "Symptoms": [
        {
          "name": "Migraine today",
          "explanation": "Whether you had a migraine.",
          "fieldDescription": "Whether you had a migraine (yes/no)",
          "field": "binary",
          "goal": {
            "freq": "Less",
            "threshold": 1,
            "timespan": "Week"
          }
        }
      ],
      "Treatments": [
        {
          "name": "As-needed medications today",
          "explanation": "Any medication you take on an as-needed basis (in response to symptoms).  For example: advil, excedrin, tylenol, prescription medications you don't take daily.",
          "fieldDescription": "Whether you took any as-needed medication today",
          "field": "binary",
          "goal": {
            "freq": "Less",
            "threshold": 2,
            "timespan": "Week"
          },

        }
      ]
    };
    let quickTrackers = defaultTrackers;
    return quickTrackers;
  }


  trackData(newData) {
    // todo: should store a datapoint in couch as a new object
    // console.log(newData); // push to db
    this.trackedData.push(newData);
    console.log(this.trackedData);
  }



  combineDataToTrack(oldDataToTrack, newDataToTrack) {
    // should return all data to track
    if(newDataToTrack) {
      // @ts-ignore
      for (const [dataType, newData] of Object.entries(newDataToTrack)) {
        if (dataType in oldDataToTrack) {
          oldDataToTrack[dataType] = oldDataToTrack[dataType].concat(newData)
        } else {
          oldDataToTrack[dataType] = newData;
        }
      }
    }
    console.log(oldDataToTrack);
    return oldDataToTrack;
  }

  addGoalFromSetup(setupDict) {
    // todo: actually push to database
    let goalsOnly = this.globalFunctions.getAllGoalsAndSubgoals(setupDict.configPath);
    if('goals' in this.activeUserGoals) {
      this.activeUserGoals['deactivated'] = new Date(); // push
      let newGoal = {'goals': goalsOnly.concat(this.activeUserGoals['goals']),
                      'dataToTrack':
                        this.combineDataToTrack(this.activeUserGoals['dataToTrack'], setupDict['dataToTrack']),
                      'textGoals': this.activeUserGoals['textGoals'] + "; " + setupDict['textGoals'],
                      'dateAdded': new Date(),
                      'notifications': setupDict.notificationSettings ?
                                          setupDict.notificationSettings : this.activeUserGoals['notifications'],

                      'trackingFreq': setupDict.notificationSettings ?
                        setupDict.notificationSettings : this.activeUserGoals['trackingFreq']};
      this.activeUserGoals = newGoal; // push
    }
    else{
      this.activeUserGoals = {'goals': goalsOnly,
                              'dataToTrack': setupDict.dataToTrack,
                              'textGoals': [setupDict.textGoals],
                              'dateAdded': new Date(),
                              'notifications': setupDict.notificationSettings,
                              'trackingFreq': setupDict.notificationSettings};
    }
    console.log(this.activeUserGoals);
    return this.activeUserGoals;
  }

  removeGoal(goal) {
    // todo: push to database
    if(goal === 'textGoal'){
      this.activeUserGoals['textGoals'] = undefined;
    }
    else{
      this.activeUserGoals['goals'].splice(this.activeUserGoals['goals'].indexOf(goal), 1);
    }
  }

  editTextGoal(newGoal){
    // todo: push to database
    this.activeUserGoals['textGoals'] = newGoal;
  }

  getPreviouslyAddedGoals() {
    // todo: should pull (active? All???) goals
  }

  getPreviouslyTrackedData() {
    // todo: should pull data from database
  }


  getActiveGoals() {
    if(Object.keys(this.activeUserGoals).length > 0){
      return this.activeUserGoals;
    }
    return this.getExampleGoal(); //todo: will leave
   // return {};
  }


  getTrackedData() {
    // todo!
    if(this.trackedData.length > 0){
      return this.trackedData;
    }
    else{
      return this.getExamplePreviouslyTracked();
    }
  }


  getExamplePreviouslyTracked() {
    return [
      {
        "Symptoms": {
          "Migraine today": true,
          "Peak migraine severity": 9,
          "Migraine duration": {'start': "19:42", 'end': "12:43"}
        },
        "Treatments": {
          "As-needed medications today": true,
          "Minutes exercised today": ""
        },
        "Triggers": {
          "Stress today": "Some"
        },
        "dateTracked": "2019-03-06T19:04:49.572Z"
      },
      {
        "Symptoms": {
          "Headache today": true
        },
        "Treatments": {
          "Minutes exercised today": "30"
        },
        "Triggers": {
          "Stress today": "Lots"
        },
        "dateTracked": "2019-02-12T19:05:05.582Z"
      },
      {
        "Symptoms": {
          "Migraine today": true,
          "Peak migraine severity": 3
        },
        "Treatments": {
          "As-needed medications today": true
        },
        "Triggers": {
          "Stress today": "Some"
        },
        "dateTracked": "2019-02-07T19:05:05.582Z"
      },
      {
        "Treatments": {
          "Minutes exercised today": "45"
        },
        "Triggers": {
          "Stress today": "None"
        },
        "dateTracked": "2019-02-05T19:44:06.425Z"
      },
      {
        "Symptoms": {
          "Headache today": true
        },
        "Treatments": {
          "Minutes exercised today": "15"
        },
        "Triggers": {
          "Stress today": "Some"
        },
        "dateTracked": "2019-02-18T19:44:51.472Z"
      },
      {
        "Symptoms": {
          "Migraine today": true,
          "Headache today": true,
          "Peak migraine severity": 2
        },
        "Treatments": {
          "As-needed medications today": true
        },
        "Triggers": {
          "Stress today": "Some"
        },
        "dateTracked": "2019-02-18T19:45:06.669Z"
      }
    ]
  }


  getExampleGoal() {
    let exGoal = {
      "goals": [
        "Learning about my migraines",
        "Monitoring my migraines",
        "Learn what factors may affect my migraines",
        "Monitor for my doctor"
      ],
      "dateAdded": "2019-02-13T03:19:26.639Z",
      "dataToTrack": {
        "Symptoms": [
          {
            "name": "Migraine today",
            "explanation": "Whether you had a migraine.",
            "fieldDescription": "Whether you had a migraine (yes/no)",
            "field": "binary",
            "goal": {
              "freq": "Less",
              "threshold": 1,
              "timespan": "Week"
            },
            "recommendingGoal": [
              "Learn what factors may affect my migraines",
              "Monitor for my doctor"
            ],
            "opts": {
              "showBackdrop": true,
              "enableBackdropDismiss": true
            },
            "selected": true
          },
          {
            "name": "Headache today",
            "explanation": "Whether you had a (non-migraine) headache.",
            "fieldDescription": "Whether you had a headache (yes/no)",
            "field": "binary",
            "recommendingGoal": [
              "Monitor for my doctor"
            ],
            "opts": {
              "showBackdrop": true,
              "enableBackdropDismiss": true
            },
            "selected": true
          },
          {
            "name": "Peak migraine severity",
            "explanation": "How bad your migraine was at its worst point.",
            "fieldDescription": "Pain level from 1-10",
            "field": "numeric scale",
            "condition": "migraineToday",
            "recommendingGoal": [
              "Monitor for my doctor"
            ],
            "opts": {
              "showBackdrop": true,
              "enableBackdropDismiss": true
            },
            "selected": true
          },
          {
            "name": "Migraine duration",
            "field": "time range",
            "goal": {},
            "selected": true,
            "custom": true
          }
        ],
        "Treatments": [
          {
            "name": "As-needed medications today",
            "explanation": "Any medication you take on an as-needed basis (in response to symptoms).  For example: advil, excedrin, tylenol, prescription medications you don't take daily.",
            "fieldDescription": "Whether you took any as-needed medication today",
            "field": "binary",
            "goal": {
              "freq": "Less",
              "threshold": 2,
              "timespan": "Week"
            },
            "recommendingGoal": [
              "Learn what factors may affect my migraines",
              "Monitor for my doctor"
            ],
            "opts": {
              "showBackdrop": true,
              "enableBackdropDismiss": true
            },
            "selected": true
          },
          {
            "name": "Minutes exercised today",
            "explanation": "How much you exercised",
            "fieldDescription": "Number of minutes of exercise",
            "field": "number",
            "goal": {
              "freq": "More",
              "threshold": 120,
              "timespan": "Week"
            },
            "significance": "Regular exercise can help guard against migraines",
            "opts": {
              "showBackdrop": true,
              "enableBackdropDismiss": true
            },
            "selected": true
          },
          {
            "name": "Time took advil",
            "field": "time",
            "goal": {},
            "selected": true,
            "custom": true
          }
        ],
        "Triggers": [
          {
            "name": "Stress today",
            "explanation": "How stressed you were today.",
            "fieldDescription": "3-point stress rating",
            "field": "category scale",
            "significance": "High stress levels can lead to more migraines",
            "recommendingGoal": [
              "Learn what factors may affect my migraines"
            ],
            "opts": {
              "showBackdrop": true,
              "enableBackdropDismiss": true
            },
            "selected": true
          },
          // {
          //   "name": "Frequent Use of Medications",
          //   "explanation": "If you use as-needed medications too frequently, they can start causing more migraines.  We will calculate how many you take and let you know if you might want to think about cutting back.",
          //   "fieldDescription": "Number of pills you took",
          //   "field": "calculated medication use",
          //   "goal": {
          //     "freq": "Less",
          //     "threshold": 2,
          //     "timespan": "Week"
          //   },
          //   "significance": "If you use as-needed medications too frequently, they can start causing more migraines.",
          //   "recommendingGoal": [
          //     "Learn what factors may affect my migraines",
          //     "Monitor for my doctor"
          //   ],
          //   "opts": {
          //     "showBackdrop": true,
          //     "enableBackdropDismiss": true
          //   },
          //   "selected": true
          // }
        ],
        "Other": [
          {
            "name": "abnormalities",
            "field": "note",
            "goal": {},
            "selected": true,
            "custom": true
          }
        ]
      },
      "textGoals": [
        "Have fewer migraines"
      ],
      "notifications": {
        "timescale": "Weekly",
        "timeOfDay": "18:16",
        "startDate": "2019-02-25T18:16:48.727Z",
        "dayOfWeek": [
          "Monday",
          "Wednesday",
          "Friday"
        ]
      }
    };
    this.activeUserGoals = exGoal;
    return exGoal;
  }






}
