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
        "dateTracked": "2019-01-18T14:51:00.000Z",
        "Triggers": {
          "Stress": 7,
          "Went to bed": "00:11",
          "Screen time": 16,
          "Cups of Coffee": 2,
          "Menstruating": false,
          "Sugar": "None",
          "Sleep": {
            "start": "01:21",
            "end": "11:41"
          }
        },
        "Treatments": {
          "Minutes exercised today": 6,
          "Time took advil": "05:40",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "05:12",
            "end": "20:39"
          },
          "Peak migraine severity": 10,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-18T00:00:00.000Z",
        "endTime": "2019-01-19T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-23T01:21:00.000Z",
        "Triggers": {
          "Stress": 7,
          "Went to bed": "15:25",
          "Screen time": 8,
          "Cups of Coffee": 1,
          "Menstruating": false,
          "Sugar": "Some",
          "Sleep": {
            "start": "17:20",
            "end": "21:29"
          }
        },
        "Treatments": {
          "Minutes exercised today": 9,
          "Time took advil": "22:27",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "07:39",
            "end": "19:48"
          },
          "Peak migraine severity": 3,
          "Migraine today": true,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-23T00:00:00.000Z",
        "endTime": "2019-02-24T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-15T22:33:00.000Z",
        "Triggers": {
          "Stress": 9,
          "Went to bed": "00:40",
          "Screen time": 16,
          "Cups of Coffee": 2,
          "Menstruating": false,
          "Sugar": "Some",
          "Sleep": {
            "start": "22:20",
            "end": "23:44"
          }
        },
        "Treatments": {
          "Minutes exercised today": 2,
          "Time took advil": "19:02",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "12:34",
            "end": "20:56"
          },
          "Peak migraine severity": 5,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-15T00:00:00.000Z",
        "endTime": "2019-03-16T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-27T07:54:00.000Z",
        "Triggers": {
          "Stress": 1,
          "Went to bed": "13:46",
          "Screen time": 6,
          "Cups of Coffee": 3,
          "Menstruating": true,
          "Sugar": "None",
          "Sleep": {
            "start": "22:36",
            "end": "22:48"
          }
        },
        "Treatments": {
          "Minutes exercised today": 15,
          "Time took advil": "19:23",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "07:03",
            "end": "17:17"
          },
          "Peak migraine severity": 5,
          "Migraine today": true,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-27T00:00:00.000Z",
        "endTime": "2019-01-28T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-27T18:29:00.000Z",
        "Triggers": {
          "Stress": 7,
          "Went to bed": "20:46",
          "Screen time": 7,
          "Cups of Coffee": 2,
          "Menstruating": true,
          "Sugar": "None",
          "Sleep": {
            "start": "06:20",
            "end": "08:43"
          }
        },
        "Treatments": {
          "Minutes exercised today": 0,
          "Time took advil": "04:13",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "17:36",
            "end": "18:39"
          },
          "Peak migraine severity": 2,
          "Migraine today": true,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-27T00:00:00.000Z",
        "endTime": "2019-01-28T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-02T20:38:00.000Z",
        "Triggers": {
          "Stress": 8,
          "Went to bed": "21:20",
          "Screen time": 7,
          "Cups of Coffee": 0,
          "Menstruating": true,
          "Sugar": "None",
          "Sleep": {
            "start": "14:15",
            "end": "21:21"
          }
        },
        "Treatments": {
          "Minutes exercised today": 13,
          "Time took advil": "23:18",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "23:10",
            "end": "23:40"
          },
          "Peak migraine severity": 9,
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-02T00:00:00.000Z",
        "endTime": "2019-02-03T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-04T19:33:00.000Z",
        "Triggers": {
          "Stress": 7,
          "Went to bed": "22:27",
          "Screen time": 16,
          "Cups of Coffee": 3,
          "Menstruating": false,
          "Sugar": "Some",
          "Sleep": {
            "start": "09:21",
            "end": "23:58"
          }
        },
        "Treatments": {
          "Minutes exercised today": 17,
          "Time took advil": "05:56",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "10:25",
            "end": "21:45"
          },
          "Peak migraine severity": 4,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-04T00:00:00.000Z",
        "endTime": "2019-03-05T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-14T21:49:00.000Z",
        "Triggers": {
          "Stress": 7,
          "Went to bed": "11:13",
          "Screen time": 12,
          "Cups of Coffee": 2,
          "Menstruating": false,
          "Sugar": "None",
          "Sleep": {
            "start": "08:51",
            "end": "16:57"
          }
        },
        "Treatments": {
          "Minutes exercised today": 6,
          "Time took advil": "04:11",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "06:46",
            "end": "17:56"
          },
          "Peak migraine severity": 3,
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-14T00:00:00.000Z",
        "endTime": "2019-02-15T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-20T05:01:00.000Z",
        "Triggers": {
          "Stress": 1,
          "Went to bed": "19:21",
          "Screen time": 5,
          "Cups of Coffee": 0,
          "Menstruating": true,
          "Sugar": "Some",
          "Sleep": {
            "start": "17:53",
            "end": "19:58"
          }
        },
        "Treatments": {
          "Minutes exercised today": 16,
          "Time took advil": "07:26",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "20:14",
            "end": "22:49"
          },
          "Peak migraine severity": 5,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-20T00:00:00.000Z",
        "endTime": "2019-03-21T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-16T20:40:00.000Z",
        "Triggers": {
          "Stress": 3,
          "Went to bed": "10:24",
          "Screen time": 14,
          "Cups of Coffee": 0,
          "Menstruating": false,
          "Sugar": "None",
          "Sleep": {
            "start": "22:00",
            "end": "23:19"
          }
        },
        "Treatments": {
          "Minutes exercised today": 12,
          "Time took advil": "10:52",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "22:01",
            "end": "22:36"
          },
          "Peak migraine severity": 5,
          "Migraine today": true,
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
        "dateTracked": "2019-02-26T22:40:00.000Z",
        "Triggers": {
          "Stress": 2,
          "Went to bed": "14:53",
          "Screen time": 19,
          "Cups of Coffee": 1,
          "Menstruating": true,
          "Sugar": "None",
          "Sleep": {
            "start": "20:39",
            "end": "20:57"
          }
        },
        "Treatments": {
          "Minutes exercised today": 10,
          "Time took advil": "20:29",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "07:30",
            "end": "19:40"
          },
          "Peak migraine severity": 4,
          "Migraine today": false,
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
        "dateTracked": "2019-03-04T22:58:00.000Z",
        "Triggers": {
          "Stress": 2,
          "Went to bed": "03:39",
          "Screen time": 13,
          "Cups of Coffee": 0,
          "Menstruating": true,
          "Sugar": "None",
          "Sleep": {
            "start": "21:35",
            "end": "22:40"
          }
        },
        "Treatments": {
          "Minutes exercised today": 3,
          "Time took advil": "13:26",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "05:41",
            "end": "20:50"
          },
          "Peak migraine severity": 4,
          "Migraine today": true,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-04T00:00:00.000Z",
        "endTime": "2019-03-05T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-03T16:31:00.000Z",
        "Triggers": {
          "Stress": 10,
          "Went to bed": "01:05",
          "Screen time": 18,
          "Cups of Coffee": 0,
          "Menstruating": true,
          "Sugar": "None",
          "Sleep": {
            "start": "10:12",
            "end": "21:24"
          }
        },
        "Treatments": {
          "Minutes exercised today": 1,
          "Time took advil": "11:52",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "06:54",
            "end": "12:58"
          },
          "Peak migraine severity": 4,
          "Migraine today": true,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-03T00:00:00.000Z",
        "endTime": "2019-01-04T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-20T01:11:00.000Z",
        "Triggers": {
          "Stress": 4,
          "Went to bed": "02:05",
          "Screen time": 4,
          "Cups of Coffee": 3,
          "Menstruating": false,
          "Sugar": "Some",
          "Sleep": {
            "start": "17:01",
            "end": "18:32"
          }
        },
        "Treatments": {
          "Minutes exercised today": 7,
          "Time took advil": "17:05",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "04:51",
            "end": "21:59"
          },
          "Peak migraine severity": 8,
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-20T00:00:00.000Z",
        "endTime": "2019-03-21T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-14T16:00:00.000Z",
        "Triggers": {
          "Stress": 4,
          "Went to bed": "10:59",
          "Screen time": 18,
          "Cups of Coffee": 3,
          "Menstruating": true,
          "Sugar": "Some",
          "Sleep": {
            "start": "12:58",
            "end": "15:59"
          }
        },
        "Treatments": {
          "Minutes exercised today": 15,
          "Time took advil": "09:30",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "20:42",
            "end": "21:52"
          },
          "Peak migraine severity": 10,
          "Migraine today": true,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-14T00:00:00.000Z",
        "endTime": "2019-02-15T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-02T18:43:00.000Z",
        "Triggers": {
          "Stress": 9,
          "Went to bed": "05:43",
          "Screen time": 2,
          "Cups of Coffee": 3,
          "Menstruating": true,
          "Sugar": "Some",
          "Sleep": {
            "start": "01:05",
            "end": "06:29"
          }
        },
        "Treatments": {
          "Minutes exercised today": 17,
          "Time took advil": "17:22",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "17:06",
            "end": "17:13"
          },
          "Peak migraine severity": 5,
          "Migraine today": true,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-02T00:00:00.000Z",
        "endTime": "2019-02-03T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-16T12:32:00.000Z",
        "Triggers": {
          "Stress": 3,
          "Went to bed": "14:07",
          "Screen time": 3,
          "Cups of Coffee": 2,
          "Menstruating": true,
          "Sugar": "Some",
          "Sleep": {
            "start": "18:47",
            "end": "20:48"
          }
        },
        "Treatments": {
          "Minutes exercised today": 8,
          "Time took advil": "04:39",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "07:00",
            "end": "12:21"
          },
          "Peak migraine severity": 9,
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
        "dateTracked": "2019-03-07T21:11:00.000Z",
        "Triggers": {
          "Stress": 6,
          "Went to bed": "16:02",
          "Screen time": 12,
          "Cups of Coffee": 1,
          "Menstruating": false,
          "Sugar": "Some",
          "Sleep": {
            "start": "04:53",
            "end": "13:53"
          }
        },
        "Treatments": {
          "Minutes exercised today": 13,
          "Time took advil": "21:14",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "11:20",
            "end": "20:26"
          },
          "Peak migraine severity": 7,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-07T00:00:00.000Z",
        "endTime": "2019-03-08T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-13T07:28:00.000Z",
        "Triggers": {
          "Stress": 3,
          "Went to bed": "16:10",
          "Screen time": 8,
          "Cups of Coffee": 2,
          "Menstruating": false,
          "Sugar": "None",
          "Sleep": {
            "start": "03:17",
            "end": "16:27"
          }
        },
        "Treatments": {
          "Minutes exercised today": 16,
          "Time took advil": "01:27",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "22:09",
            "end": "22:59"
          },
          "Peak migraine severity": 4,
          "Migraine today": true,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-13T00:00:00.000Z",
        "endTime": "2019-02-14T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-14T18:04:00.000Z",
        "Triggers": {
          "Stress": 2,
          "Went to bed": "04:56",
          "Screen time": 9,
          "Cups of Coffee": 2,
          "Menstruating": false,
          "Sugar": "None",
          "Sleep": {
            "start": "13:56",
            "end": "17:56"
          }
        },
        "Treatments": {
          "Minutes exercised today": 18,
          "Time took advil": "11:08",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "09:51",
            "end": "18:54"
          },
          "Peak migraine severity": 10,
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-14T00:00:00.000Z",
        "endTime": "2019-03-15T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-08T18:25:00.000Z",
        "Triggers": {
          "Stress": 2,
          "Went to bed": "23:09",
          "Screen time": 1,
          "Cups of Coffee": 2,
          "Menstruating": false,
          "Sugar": "None",
          "Sleep": {
            "start": "21:16",
            "end": "22:33"
          }
        },
        "Treatments": {
          "Minutes exercised today": 14,
          "Time took advil": "00:54",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "04:50",
            "end": "10:55"
          },
          "Peak migraine severity": 9,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-08T00:00:00.000Z",
        "endTime": "2019-02-09T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-02T20:46:00.000Z",
        "Triggers": {
          "Stress": 6,
          "Went to bed": "03:41",
          "Screen time": 10,
          "Cups of Coffee": 1,
          "Menstruating": false,
          "Sugar": "Some",
          "Sleep": {
            "start": "00:01",
            "end": "20:37"
          }
        },
        "Treatments": {
          "Minutes exercised today": 16,
          "Time took advil": "00:35",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "19:14",
            "end": "22:23"
          },
          "Peak migraine severity": 5,
          "Migraine today": true,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-02T00:00:00.000Z",
        "endTime": "2019-01-03T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-25T07:32:00.000Z",
        "Triggers": {
          "Stress": 2,
          "Went to bed": "19:37",
          "Screen time": 6,
          "Cups of Coffee": 2,
          "Menstruating": true,
          "Sugar": "Some",
          "Sleep": {
            "start": "11:54",
            "end": "11:55"
          }
        },
        "Treatments": {
          "Minutes exercised today": 16,
          "Time took advil": "21:04",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "23:17",
            "end": "23:43"
          },
          "Peak migraine severity": 6,
          "Migraine today": true,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-25T00:00:00.000Z",
        "endTime": "2019-01-26T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-21T19:10:00.000Z",
        "Triggers": {
          "Stress": 4,
          "Went to bed": "15:37",
          "Screen time": 4,
          "Cups of Coffee": 1,
          "Menstruating": false,
          "Sugar": "None",
          "Sleep": {
            "start": "21:56",
            "end": "22:56"
          }
        },
        "Treatments": {
          "Minutes exercised today": 8,
          "Time took advil": "10:05",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "22:30",
            "end": "22:41"
          },
          "Peak migraine severity": 6,
          "Migraine today": true,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-21T00:00:00.000Z",
        "endTime": "2019-03-22T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-19T13:44:00.000Z",
        "Triggers": {
          "Stress": 7,
          "Went to bed": "23:27",
          "Screen time": 19,
          "Cups of Coffee": 3,
          "Menstruating": true,
          "Sugar": "None",
          "Sleep": {
            "start": "21:07",
            "end": "21:54"
          }
        },
        "Treatments": {
          "Minutes exercised today": 12,
          "Time took advil": "17:26",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "16:49",
            "end": "18:52"
          },
          "Peak migraine severity": 4,
          "Migraine today": true,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-19T00:00:00.000Z",
        "endTime": "2019-01-20T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-05T09:34:00.000Z",
        "Triggers": {
          "Stress": 6,
          "Went to bed": "07:12",
          "Screen time": 17,
          "Cups of Coffee": 3,
          "Menstruating": true,
          "Sugar": "None",
          "Sleep": {
            "start": "12:22",
            "end": "20:43"
          }
        },
        "Treatments": {
          "Minutes exercised today": 8,
          "Time took advil": "17:11",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "10:11",
            "end": "12:46"
          },
          "Peak migraine severity": 7,
          "Migraine today": true,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-05T00:00:00.000Z",
        "endTime": "2019-01-06T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-19T09:32:00.000Z",
        "Triggers": {
          "Stress": 6,
          "Went to bed": "20:26",
          "Screen time": 0,
          "Cups of Coffee": 3,
          "Menstruating": true,
          "Sugar": "None",
          "Sleep": {
            "start": "13:12",
            "end": "23:33"
          }
        },
        "Treatments": {
          "Minutes exercised today": 8,
          "Time took advil": "17:21",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "14:04",
            "end": "23:28"
          },
          "Peak migraine severity": 2,
          "Migraine today": false,
          "Headache today": true
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-19T00:00:00.000Z",
        "endTime": "2019-03-20T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-22T23:53:00.000Z",
        "Triggers": {
          "Stress": 2,
          "Went to bed": "10:20",
          "Screen time": 8,
          "Cups of Coffee": 3,
          "Menstruating": false,
          "Sugar": "Some",
          "Sleep": {
            "start": "22:10",
            "end": "22:28"
          }
        },
        "Treatments": {
          "Minutes exercised today": 0,
          "Time took advil": "13:12",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "16:10",
            "end": "16:40"
          },
          "Peak migraine severity": 10,
          "Migraine today": true,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-01-22T00:00:00.000Z",
        "endTime": "2019-01-23T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-21T18:18:00.000Z",
        "Triggers": {
          "Stress": 6,
          "Went to bed": "17:37",
          "Screen time": 8,
          "Cups of Coffee": 1,
          "Menstruating": false,
          "Sugar": "Some",
          "Sleep": {
            "start": "20:44",
            "end": "22:45"
          }
        },
        "Treatments": {
          "Minutes exercised today": 19,
          "Time took advil": "19:14",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "08:51",
            "end": "12:57"
          },
          "Peak migraine severity": 2,
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-21T00:00:00.000Z",
        "endTime": "2019-03-22T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-12T02:46:00.000Z",
        "Triggers": {
          "Stress": 2,
          "Went to bed": "20:56",
          "Screen time": 4,
          "Cups of Coffee": 3,
          "Menstruating": true,
          "Sugar": "None",
          "Sleep": {
            "start": "20:12",
            "end": "21:15"
          }
        },
        "Treatments": {
          "Minutes exercised today": 2,
          "Time took advil": "08:10",
          "As-needed medications today": true
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "09:41",
            "end": "18:49"
          },
          "Peak migraine severity": 1,
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-02-12T00:00:00.000Z",
        "endTime": "2019-02-13T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-23T21:30:00.000Z",
        "Triggers": {
          "Stress": 3,
          "Went to bed": "23:35",
          "Screen time": 2,
          "Cups of Coffee": 2,
          "Menstruating": false,
          "Sugar": "Some",
          "Sleep": {
            "start": "10:47",
            "end": "18:53"
          }
        },
        "Treatments": {
          "Minutes exercised today": 4,
          "Time took advil": "14:15",
          "As-needed medications today": false
        },
        "Symptoms": {
          "Migraine duration": {
            "start": "10:08",
            "end": "19:45"
          },
          "Peak migraine severity": 7,
          "Migraine today": false,
          "Headache today": false
        },
        "Other": {
          "abnormalities": "note contents moot"
        },
        "startTime": "2019-03-23T00:00:00.000Z",
        "endTime": "2019-03-24T00:00:00.000Z"
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
