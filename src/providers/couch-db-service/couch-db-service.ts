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
    // todo: needs to append start and end time!!!
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
        "allDay": "true",
        "dateTracked": "2019-02-26T05:54:00.000Z",
        "Triggers": {
          "Stress": 3,
          "Went to bed": "18:32",
          "Screen time": 13,
          "Cups of Coffee": 0,
          "Menstruating": false,
          "Sugar": "None",
          "Sleep": {
            "start": "04:49",
            "end": "05:56"
          }
        },
        "Treatments": {
          "Minutes exercised today": 10,
          "Time took advil": "21:55",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "18:03",
            "end": "21:13"
          },
          "Peak migraine severity": 8,
          "Migraine today": true,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-26T00:00:00.000Z",
        "endTime": "2019-02-27T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-09T06:43:00.000Z",
        "Triggers": {
          "Stress": 10,
          "Went to bed": "13:13",
          "Screen time": 17,
          "Cups of Coffee": 1,
          "Menstruating": false,
          "Sugar": "None",
          "Sleep": {
            "start": "18:06",
            "end": "23:40"
          }
        },
        "Treatments": {
          "Time took advil": "15:00",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "03:25",
            "end": "11:27"
          },
          "Peak migraine severity": 3,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-09T00:00:00.000Z",
        "endTime": "2019-02-10T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-10T19:54:00.000Z",
        "Triggers": {
          "Stress": 9,
          "Screen time": 7,
          "Cups of Coffee": 1,
          "Menstruating": false,
          "Sugar": "None",
          "Sleep": {
            "start": "22:38",
            "end": "22:43"
          }
        },
        "Treatments": {
          "Time took advil": "17:08"
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "05:07",
            "end": "08:35"
          },
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {},
        "startTime": "2019-01-10T00:00:00.000Z",
        "endTime": "2019-01-11T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-22T19:33:00.000Z",
        "Triggers": {
          "Stress": 5,
          "Went to bed": "06:49",
          "Screen time": 3,
          "Cups of Coffee": 1,
          "Menstruating": false,
          "Sugar": "None",
          "Sleep": {
            "start": "08:03",
            "end": "19:38"
          }
        },
        "Treatments": {
          "Minutes exercised today": 0,
          "Time took advil": "19:21",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Peak migraine severity": 3,
          "Migraine today": true,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-22T00:00:00.000Z",
        "endTime": "2019-02-23T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-28T17:27:00.000Z",
        "Triggers": {
          "Stress": 3,
          "Went to bed": "15:15",
          "Cups of Coffee": 3,
          "Menstruating": true,
          "Sugar": "Some",
          "Sleep": {
            "start": "04:58",
            "end": "14:59"
          }
        },
        "Treatments": {
          "Minutes exercised today": 18,
          "Time took advil": "14:02",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "04:07",
            "end": "12:30"
          },
          "Migraine today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-28T00:00:00.000Z",
        "endTime": "2019-01-29T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-24T03:38:00.000Z",
        "Triggers": {
          "Cups of Coffee": 3,
          "Sleep": {
            "start": "11:08",
            "end": "23:31"
          },
          "Stress": 8,
          "Screen time": 2,
          "Sugar": "None"
        },
        "Treatments": {
          "Minutes exercised today": 12,
          "Time took advil": "22:43"
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "22:19",
            "end": "23:55"
          },
          "Peak migraine severity": 5,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {},
        "startTime": "2019-01-24T00:00:00.000Z",
        "endTime": "2019-01-25T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-22T12:19:00.000Z",
        "Triggers": {
          "Stress": 8,
          "Went to bed": "07:22",
          "Screen time": 5,
          "Cups of Coffee": 1,
          "Menstruating": true,
          "Sugar": "Some",
          "Sleep": {
            "start": "17:17",
            "end": "18:29"
          }
        },
        "Treatments": {
          "Minutes exercised today": 5,
          "Time took advil": "01:25",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "22:23",
            "end": "22:56"
          },
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {},
        "startTime": "2019-02-22T00:00:00.000Z",
        "endTime": "2019-02-23T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-15T19:22:00.000Z",
        "Triggers": {
          "Cups of Coffee": 2,
          "Stress": 5,
          "Menstruating": true,
          "Sleep": {
            "start": "16:00",
            "end": "19:23"
          },
          "Sugar": "None"
        },
        "Treatments": {
          "Minutes exercised today": 15,
          "Time took advil": "00:42",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "04:40",
            "end": "11:47"
          },
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-15T00:00:00.000Z",
        "endTime": "2019-02-16T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-21T02:33:00.000Z",
        "Triggers": {
          "Stress": 4,
          "Went to bed": "06:14",
          "Screen time": 11,
          "Cups of Coffee": 1,
          "Sugar": "Some",
          "Sleep": {
            "start": "16:33",
            "end": "21:39"
          }
        },
        "Treatments": {
          "Time took advil": "23:04",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "21:55",
            "end": "21:56"
          },
          "Peak migraine severity": 6,
          "Migraine today": false
        },
        "Other": {},
        "startTime": "2019-02-21T00:00:00.000Z",
        "endTime": "2019-02-22T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-24T02:09:00.000Z",
        "Triggers": {
          "Cups of Coffee": 3,
          "Went to bed": "14:10",
          "Menstruating": false,
          "Sleep": {
            "start": "16:07",
            "end": "22:50"
          },
          "Sugar": "None"
        },
        "Treatments": {
          "Minutes exercised today": 15,
          "Time took advil": "14:13",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "00:58",
            "end": "23:58"
          },
          "Peak migraine severity": 8,
          "Migraine today": true,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-24T00:00:00.000Z",
        "endTime": "2019-01-25T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-23T22:27:00.000Z",
        "Triggers": {
          "Stress": 3,
          "Went to bed": "13:47",
          "Screen time": 9,
          "Cups of Coffee": 2,
          "Menstruating": false,
          "Sugar": "Some",
          "Sleep": {
            "start": "10:30",
            "end": "13:39"
          }
        },
        "Treatments": {
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "06:44",
            "end": "21:47"
          },
          "Peak migraine severity": 7,
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-23T00:00:00.000Z",
        "endTime": "2019-01-24T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-01T09:43:00.000Z",
        "Triggers": {
          "Cups of Coffee": 3,
          "Went to bed": "14:39",
          "Menstruating": true,
          "Screen time": 17,
          "Sugar": "Some"
        },
        "Treatments": {
          "Minutes exercised today": 0,
          "Time took advil": "21:00",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "07:17",
            "end": "17:54"
          },
          "Peak migraine severity": 1,
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {},
        "startTime": "2019-02-01T00:00:00.000Z",
        "endTime": "2019-02-02T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-06T22:08:00.000Z",
        "Triggers": {
          "Cups of Coffee": 2,
          "Stress": 8,
          "Menstruating": true,
          "Sleep": {
            "start": "21:02",
            "end": "21:33"
          },
          "Went to bed": "15:27"
        },
        "Treatments": {
          "Minutes exercised today": 4,
          "Time took advil": "11:26",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Peak migraine severity": 7,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-06T00:00:00.000Z",
        "endTime": "2019-02-07T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-22T18:14:00.000Z",
        "Triggers": {
          "Cups of Coffee": 1,
          "Went to bed": "15:25",
          "Menstruating": true,
          "Screen time": 9,
          "Sugar": "Some"
        },
        "Treatments": {
          "Minutes exercised today": 18,
          "Time took advil": "13:50",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Peak migraine severity": 3,
          "Migraine today": false
        },
        "Other": {},
        "startTime": "2019-03-22T00:00:00.000Z",
        "endTime": "2019-03-23T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-05T18:19:00.000Z",
        "Triggers": {
          "Stress": 1,
          "Went to bed": "15:04",
          "Screen time": 9,
          "Menstruating": false,
          "Sugar": "None",
          "Sleep": {
            "start": "16:13",
            "end": "20:37"
          }
        },
        "Treatments": {
          "Time took advil": "16:12",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "01:12",
            "end": "20:23"
          },
          "Peak migraine severity": 10,
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {},
        "startTime": "2019-02-05T00:00:00.000Z",
        "endTime": "2019-02-06T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-20T03:44:00.000Z",
        "Triggers": {
          "Cups of Coffee": 0,
          "Stress": 7,
          "Menstruating": false,
          "Sleep": {
            "start": "21:10",
            "end": "22:38"
          },
          "Sugar": "None"
        },
        "Treatments": {
          "Minutes exercised today": 4,
          "Time took advil": "16:04"
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "19:22",
            "end": "23:28"
          },
          "Peak migraine severity": 5,
          "Migraine today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-20T00:00:00.000Z",
        "endTime": "2019-03-21T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-03T13:53:00.000Z",
        "Triggers": {
          "Stress": 4,
          "Screen time": 17,
          "Cups of Coffee": 1,
          "Menstruating": true,
          "Sugar": "None",
          "Sleep": {
            "start": "23:43",
            "end": "23:44"
          }
        },
        "Treatments": {
          "Time took advil": "04:35",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "05:24",
            "end": "17:26"
          },
          "Peak migraine severity": 2,
          "Migraine today": false
        },
        "Other": {},
        "startTime": "2019-02-03T00:00:00.000Z",
        "endTime": "2019-02-04T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-16T15:08:00.000Z",
        "Triggers": {
          "Cups of Coffee": 0,
          "Stress": 7,
          "Menstruating": false,
          "Sleep": {
            "start": "05:18",
            "end": "12:43"
          },
          "Sugar": "None"
        },
        "Treatments": {
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "21:07",
            "end": "22:43"
          },
          "Peak migraine severity": 7,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-16T00:00:00.000Z",
        "endTime": "2019-02-17T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-27T04:07:00.000Z",
        "Triggers": {
          "Sleep": {
            "start": "08:47",
            "end": "15:51"
          },
          "Stress": 6,
          "Menstruating": false,
          "Screen time": 5,
          "Went to bed": "06:23"
        },
        "Treatments": {
          "Minutes exercised today": 13,
          "Time took advil": "05:21",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "08:42",
            "end": "12:51"
          },
          "Peak migraine severity": 4,
          "Migraine today": true,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-27T00:00:00.000Z",
        "endTime": "2019-01-28T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-19T13:06:00.000Z",
        "Triggers": {
          "Stress": 4,
          "Went to bed": "13:49",
          "Screen time": 1,
          "Cups of Coffee": 3,
          "Sugar": "Some",
          "Sleep": {
            "start": "15:35",
            "end": "22:57"
          }
        },
        "Treatments": {
          "Minutes exercised today": 8,
          "Time took advil": "23:20",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "09:36",
            "end": "10:43"
          },
          "Peak migraine severity": 3,
          "Migraine today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-19T00:00:00.000Z",
        "endTime": "2019-02-20T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-22T06:31:00.000Z",
        "Triggers": {
          "Stress": 8,
          "Went to bed": "01:27",
          "Screen time": 9,
          "Cups of Coffee": 2,
          "Menstruating": false,
          "Sugar": "Some",
          "Sleep": {
            "start": "20:48",
            "end": "23:53"
          }
        },
        "Treatments": {
          "Minutes exercised today": 11,
          "Time took advil": "23:48",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "00:53",
            "end": "22:56"
          },
          "Peak migraine severity": 2,
          "Migraine today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-22T00:00:00.000Z",
        "endTime": "2019-02-23T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-26T03:34:00.000Z",
        "Triggers": {
          "Cups of Coffee": 3,
          "Went to bed": "03:19",
          "Screen time": 0,
          "Sugar": "Some"
        },
        "Treatments": {
          "Minutes exercised today": 1,
          "Time took advil": "08:06",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "13:51",
            "end": "22:53"
          },
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-26T00:00:00.000Z",
        "endTime": "2019-02-27T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-25T19:16:00.000Z",
        "Triggers": {
          "Stress": 1,
          "Went to bed": "14:04",
          "Screen time": 16,
          "Cups of Coffee": 1,
          "Menstruating": false,
          "Sleep": {
            "start": "14:51",
            "end": "23:51"
          }
        },
        "Treatments": {
          "Minutes exercised today": 2,
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "20:32",
            "end": "20:41"
          },
          "Peak migraine severity": 1,
          "Migraine today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-25T00:00:00.000Z",
        "endTime": "2019-02-26T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-06T07:06:00.000Z",
        "Triggers": {
          "Stress": 1,
          "Went to bed": "12:36",
          "Screen time": 4,
          "Cups of Coffee": 2,
          "Menstruating": false,
          "Sleep": {
            "start": "01:43",
            "end": "07:45"
          }
        },
        "Treatments": {
          "Minutes exercised today": 12,
          "Time took advil": "13:20",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "19:14",
            "end": "20:55"
          },
          "Peak migraine severity": 1,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-06T00:00:00.000Z",
        "endTime": "2019-03-07T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-16T16:04:00.000Z",
        "Triggers": {
          "Stress": 1,
          "Went to bed": "21:13",
          "Screen time": 2,
          "Cups of Coffee": 0,
          "Menstruating": true,
          "Sleep": {
            "start": "17:36",
            "end": "18:55"
          }
        },
        "Treatments": {
          "Minutes exercised today": 19,
          "Time took advil": "09:33",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "09:27",
            "end": "15:55"
          },
          "Peak migraine severity": 10,
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-16T00:00:00.000Z",
        "endTime": "2019-01-17T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-28T09:00:00.000Z",
        "Triggers": {
          "Cups of Coffee": 3,
          "Stress": 6,
          "Menstruating": false,
          "Screen time": 12,
          "Sugar": "Some"
        },
        "Treatments": {
          "Minutes exercised today": 18,
          "Time took advil": "03:54",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "04:44",
            "end": "21:57"
          },
          "Peak migraine severity": 5,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-28T00:00:00.000Z",
        "endTime": "2019-03-01T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-24T05:33:00.000Z",
        "Triggers": {
          "Stress": 2,
          "Went to bed": "01:57",
          "Screen time": 18,
          "Cups of Coffee": 3,
          "Menstruating": true,
          "Sugar": "Some"
        },
        "Treatments": {
          "Minutes exercised today": 17,
          "Time took advil": "02:50",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "09:27",
            "end": "12:47"
          },
          "Peak migraine severity": 4,
          "Migraine today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-24T00:00:00.000Z",
        "endTime": "2019-01-25T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-28T21:53:00.000Z",
        "Triggers": {
          "Cups of Coffee": 2,
          "Sleep": {
            "start": "01:14",
            "end": "14:33"
          },
          "Stress": 1,
          "Went to bed": "14:41",
          "Screen time": 6
        },
        "Treatments": {
          "Minutes exercised today": 16,
          "Time took advil": "05:15",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "09:13",
            "end": "13:37"
          },
          "Peak migraine severity": 4,
          "Migraine today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-28T00:00:00.000Z",
        "endTime": "2019-01-29T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-21T14:43:00.000Z",
        "Triggers": {
          "Cups of Coffee": 3,
          "Stress": 6,
          "Menstruating": true,
          "Went to bed": "14:10",
          "Sugar": "None"
        },
        "Treatments": {
          "Minutes exercised today": 2,
          "Time took advil": "20:40",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "03:49",
            "end": "23:57"
          },
          "Peak migraine severity": 4,
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-21T00:00:00.000Z",
        "endTime": "2019-02-22T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-01T03:28:00.000Z",
        "Triggers": {
          "Stress": 7,
          "Went to bed": "13:49",
          "Screen time": 0,
          "Cups of Coffee": 1,
          "Menstruating": false,
          "Sugar": "Some"
        },
        "Treatments": {
          "Minutes exercised today": 6,
          "Time took advil": "01:12",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "05:45",
            "end": "07:51"
          },
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-01T00:00:00.000Z",
        "endTime": "2019-03-02T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-19T07:48:00.000Z",
        "Triggers": {
          "Cups of Coffee": 0,
          "Stress": 2,
          "Went to bed": "04:46",
          "Screen time": 15,
          "Sugar": "None"
        },
        "Treatments": {
          "Minutes exercised today": 0,
          "Time took advil": "21:13",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "22:56",
            "end": "22:57"
          },
          "Peak migraine severity": 3,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-19T00:00:00.000Z",
        "endTime": "2019-03-20T00:00:00.000Z"
      }
    ]
    // return [
    //   {
    //     "Symptoms": {
    //       "Migraine today": true,
    //       "Peak migraine severity": 9,
    //       "Migraine duration": {'start': "19:42", 'end': "12:43"}
    //     },
    //     'endTime': "2019-03-07T00:00:00.000Z",
    //     'startTime': "2019-03-06T00:00:00.000Z",
    //     "Treatments": {
    //       "As-needed medications today": true,
    //       "Minutes exercised today": ""
    //     },
    //     "Triggers": {
    //       "Stress today": "Some"
    //     },
    //     'allDay': true,
    //     "dateTracked": "2019-03-06T19:04:49.572Z"
    //   },
    //   {
    //     "Symptoms": {
    //       "Headache today": true
    //     },
    //     "Treatments": {
    //       "Minutes exercised today": "30"
    //     },
    //     "Triggers": {
    //       "Stress today": "Lots"
    //     },
    //     'title': "No Migraine",
    //     'allDay': true,
    //     'endTime': "2019-02-13T00:00:00.000Z",
    //     'startTime': "2019-02-12T00:00:00.000Z",
    //     "dateTracked": "2019-02-12T19:05:05.582Z"
    //   },
    //   {
    //     "Symptoms": {
    //       "Migraine today": true,
    //       "Peak migraine severity": 3
    //     },
    //     'allDay': true,
    //     // 'title': "Migraine",
    //     'endTime': "2019-02-08T00:00:00.000Z",
    //     'startTime': "2019-02-07T00:00:00.000Z",
    //     "Treatments": {
    //       "As-needed medications today": true
    //     },
    //     "Triggers": {
    //       "Stress today": "Some"
    //     },
    //     "dateTracked": "2019-02-07T19:05:05.582Z"
    //   },
    //   {
    //     "Treatments": {
    //       "Minutes exercised today": "45"
    //     },
    //     // 'title': "Migraine",
    //     'endTime': "2019-02-06T00:00:00.000Z",
    //     'startTime': "2019-02-05T00:00:00.000Z",
    //     'allDay': true,
    //     "Triggers": {
    //       "Stress today": "None"
    //     },
    //     "dateTracked": "2019-02-05T19:44:06.425Z"
    //   },
    //   {
    //     "Symptoms": {
    //       "Headache today": true
    //     },
    //     'allDay': true,
    //     'title': "No Migraine",
    //     'endTime': "2019-02-18T00:00:00.000Z",
    //     'startTime': "2019-02-17T00:00:00.000Z",
    //     "Treatments": {
    //       "Minutes exercised today": "15"
    //     },
    //     "Triggers": {
    //       "Stress today": "Some"
    //     },
    //     "dateTracked": "2019-02-18T19:44:51.472Z"
    //   },
    //   {
    //     "Symptoms": {
    //       "Migraine today": true,
    //       "Headache today": true,
    //       "Peak migraine severity": 2
    //     },
    //     'allDay': true,
    //     // 'title': "Migraine",
    //     'endTime': "2019-02-18T00:00:00.000Z",
    //     'startTime': "2019-02-17T00:00:00.000Z",
    //     "Treatments": {
    //       "As-needed medications today": true
    //     },
    //     "Triggers": {
    //       "Stress today": "Some"
    //     },
    //     "dateTracked": "2019-02-18T19:45:06.669Z"
    //   }
    // ]
  }


  getExampleGoal() {
    let exGoal = {
      "goals": [
        "Learning about my migraines",
        "Monitoring my migraines",
        "Learn what factors may affect my migraines",
        "Monitor for my doctor",
        "Learn whether a specific change affects my migraines"
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
            "explanation": "When your migraine started and ended",
            "fieldDescription": "the time it started and ended",
            "field": "time range",
            "selected": true
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
            "name": "Sugar",
            "fieldDescription": "3-point stress rating",
            "field": "category scale",
            "selected": true
          },
          {
            "name": "Menstruating",
            "fieldDescription": "binary",
            "field": "binary",
            "selected": true
          },
          {
            "name": "Cups of Coffee",
            "fieldDescription": "number small",
            "field": "number",
            "selected": true
          },
          {
            "name": "Screen time",
            "fieldDescription": "number large",
            "field": "number",
            "selected": true
          },
          {
            "name": "Stress",
            "fieldDescription": "a rating from 1-10",
            "field": "numeric scale",
            "selected": true
          },
          {
            "name": "Went to bed",
            "fieldDescription": "time",
            "field": "time",
            "selected": true
          },
          {
            "name": "Sleep",
            "fieldDescription": "start and end times",
            "field": "time range",
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
