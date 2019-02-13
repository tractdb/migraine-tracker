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


  login(credentials) {
    // log the user in based on the credentials
    return this.http.post(this.baseUrl + '/login', JSON.stringify(credentials), this.options);
  }

  userLoggedIn() {
    // see if we're logged in; response gives account
    return this.http.get(this.baseUrl + '/authenticated', this.options);
  }


  trackData(newData) {
    // todo: should store a datapoint in couch as a new object
    console.log(newData); // push to db
    this.trackedData.push(newData);
  }



  combineDataToTrack(oldDataToTrack, newDataToTrack) {
    // should return all data to track
    // @ts-ignore
    for (const [ dataType, newData ] of Object.entries(newDataToTrack)) {
      if (dataType in oldDataToTrack){
        oldDataToTrack[dataType] = oldDataToTrack[dataType].concat(newData)
      }
      else{
        oldDataToTrack[dataType] = newData;
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
                      'textGoals': this.activeUserGoals['textGoals'].push(setupDict['textGoals']),
                      'dateAdded': new Date()};
      this.activeUserGoals = newGoal; // push
    }
    else{
      this.activeUserGoals = {'goals': goalsOnly,
                              'dataToTrack': setupDict.dataToTrack,
                              'textGoals': [setupDict.textGoals],
                              'dateAdded': new Date()};
    }
    console.log(this.activeUserGoals);
    return this.activeUserGoals;
  }

  getPreviouslyAddedGoals() {
    // todo: should pull (active? All???) goals
  }

  getPreviouslyTrackedData() {
    // todo: should pull data from database
  }


  getActiveGoals() {
    // return this.activeUserGoals;
    return this.getExampleGoal();
  }


  getTrackedData() {
    return this.trackedData;
  }


  getExampleGoal() {
    return {
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
            "fieldDescription": "Number of pills you took",
            "field": "number",
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
            "name": "Minutes exercised today",
            "explanation": "How much you exercised",
            "fieldDescription": "Number of minutes of exercise",
            "field": "number",
            "goal": {
              "freq": "More",
              "threshold": 120,
              "timespan": "Week"
            },
            "opts": {
              "showBackdrop": true,
              "enableBackdropDismiss": true
            },
            "selected": true
          },
          {
            "name": "Time I took advil",
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
            "recommendingGoal": [
              "Learn what factors may affect my migraines"
            ],
            "opts": {
              "showBackdrop": true,
              "enableBackdropDismiss": true
            },
            "selected": true
          },
          {
            "name": "Frequent Use of Medications",
            "explanation": "If you use as-needed medications too frequently, they can start causing more migraines.  We will calculate how many you take and let you know if you might want to think about cutting back.",
            "fieldDescription": "Number of pills you took",
            "field": "calculated medication use",
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
          }
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
      ]
    }
  }






}
