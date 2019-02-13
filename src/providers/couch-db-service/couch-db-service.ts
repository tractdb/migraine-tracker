import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {GlobalFunctionsServiceProvider} from "../global-functions-service/global-functions-service";


@Injectable()
export class CouchDbServiceProvider {

  private baseUrl = 'https://tractdb.org/api';
  private activeUserGoals = {}; // only ONE entry is active at a given time; "goals" lists all current goals
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
                      'textGoals': this.activeUserGoals['textGoals'].push(setupDict['textGoals'])};
      this.activeUserGoals = newGoal; // push
    }
    else{
      this.activeUserGoals = {'goals': goalsOnly,
                              'dataToTrack': setupDict.dataToTrack,
                              'textGoals': [setupDict.textGoals]};
    }
    return this.activeUserGoals;
  }

  getGoalsFromDatabase() {
    // todo: should pull (active??) goals
  }


  getActiveGoals() {
    return this.activeUserGoals;
    // return this.getExampleGoal();
  }


  getExampleGoal() {
    return {
      "goals": [
        "Learning about my migraines",
        "Monitoring my migraines",
        "Learn what factors may affect my migraines",
        "Monitor for insurance"
      ],
      "dataToTrack": {
        "Symptoms": [
          {
            "name": "Migraine Days",
            "explanation": "Whether you had a migraine.",
            "fieldDescription": "Whether you had a migraine (yes/no)",
            "field": "binary",
            "goal": {
              "freq": "less",
              "threshold": 1,
              "timespan": "week"
            },
            "recommendingGoal": [
              "Learn how frequently I get migraines"
            ],
            "selected": true
          }
        ],
        "Treatments": [
          {
            "name": "As-needed medications",
            "explanation": "Any medication you take on an as-needed basis (in response to symptoms).  For example: advil, excedrin, tylenol, prescription medications you don't take daily.",
            "fieldDescription": "Number of pills you took",
            "field": "number",
            "goal": {
              "freq": "less",
              "threshold": 1,
              "timespan": "week"
            },
            "recommendingGoal": [
              "Learn how frequently I get migraines"
            ],
            "selected": true
          }
        ],
        "Triggers": [
          {
            "name": "Frequent Use of Medications",
            "explanation": "If you use as-needed medications too frequently, they can start causing more migraines.  We will calculate how many you take and let you know if you might want to think about cutting back.",
            "fieldDescription": "Number of pills you took",
            "field": "calculated medication use",
            "recommendingGoal": [
              "Learn how frequently I get migraines"
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
            "name": "trial1",
            "field": "binary",
            "goal": {
              "freq": "More",
              "threshold": 3,
              "timespan": "Day"
            },
            "selected": true,
            "custom": true
          },
          {
            "name": "trial2",
            "field": "number",
            "goal": {
              "freq": "More",
              "threshold": 3,
              "timespan": "Month"
            },
            "selected": true,
            "custom": true
          },
          {
            "name": "trial3",
            "field": "numeric scale",
            "goal": {},
            "selected": true,
            "custom": true
          },
          {
            "name": "trial4",
            "field": "category scale",
            "goal": {},
            "selected": true,
            "custom": true
          },
          {
            "name": "trial5",
            "field": "note",
            "goal": {},
            "selected": true,
            "custom": true
          },
          {
            "name": "trial6",
            "field": "time",
            "goal": {},
            "selected": true,
            "custom": true
          },
          {
            "name": "trial7",
            "field": "time range",
            "goal": {},
            "selected": true,
            "custom": true
          }
        ]
      }
    }
  }






}
