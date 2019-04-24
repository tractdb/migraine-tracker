import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {GlobalFunctionsServiceProvider} from "../global-functions-service/global-functions-service";


@Injectable()
export class CouchDbServiceProvider {

  private baseUrl : string = 'https://tractdb.org/api';
  private activeUserGoals : {[goalAspect:string]: any;} = {}; // only ONE entry is active at a given time; "goals" lists all current goals
  private trackedData : {[trackedData:string]: any;}[] = [];
  private options : {[optionName:string]: any;} = {withCredentials: true};

  constructor(public http: HttpClient, private globalFunctions: GlobalFunctionsServiceProvider) {
  }

  getCurrentBreak() : {[breakDetails: string] : any}{
    // todo: pull from db, make sure it's current
    return null;
    // return {
    //   "reasonForBreak": "I want to",
    //   "notifyDate": "2020-02-28",
    //   "started": "2019-02-27T01:07:42.495Z"
    // }
  }

  updateBreak(currentBreak : {[breakDetails: string] : any}){
    // todo: push to db
    console.log(currentBreak);
  }

  setBreak(newBreak : {[breakDetails: string] : any}){
    //todo: push to db
    console.log(newBreak);
  }


  login(credentials : {[login: string] : string}) {
    // log the user in based on the credentials
    return this.http.post(this.baseUrl + '/login', JSON.stringify(credentials), this.options);
  }

  userLoggedIn() {
    // see if we're logged in; response gives account
    return this.http.get(this.baseUrl + '/authenticated', this.options);
  }

  getQuickTrackers() : {[dataType: string] : any}{
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


  trackData(newData : {[dataType: string] : any}) {
    // todo: should store a datapoint in couch as a new object
    // console.log(newData); // push to db
    // todo: needs to append start and end time!!!
    this.trackedData.push(newData);
    console.log(this.trackedData);
  }



  combineDataToTrack(oldDataToTrack : {[dataType:string]: any;},
                     newDataToTrack : {[dataType:string]: any;}) : {[dataType:string]: any;}{
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

  addGoalFromSetup(setupDict : {[configInfo: string] : any}) : {[goalsProps:string]: any;}{
    // todo: actually push to database
    let newGoals = setupDict['goalIDs'];
    if('goals' in this.activeUserGoals) { // we're appending goals
      this.activeUserGoals['deactivated'] = new Date(); // todo: push
      let newGoal = {'goals': newGoals.concat(this.activeUserGoals['goals']),
                      'dataToTrack':
                        this.combineDataToTrack(this.activeUserGoals['dataToTrack'], setupDict['dataToTrack']),
                      'textGoals': this.activeUserGoals['textGoals'] + "; " + setupDict['textGoals'],
                      'dateAdded': new Date(),
                      'notifications': setupDict.notificationSettings ?
                                          setupDict.notificationSettings : this.activeUserGoals['notifications']};
      this.activeUserGoals = newGoal; // push
    }
    else{
      this.activeUserGoals = {'goals': newGoals,
                              'dataToTrack': setupDict.dataToTrack,
                              'textGoals': [setupDict.textGoals],
                              'dateAdded': new Date(),
                              'notifications': setupDict.notificationSettings};
    }
    console.log(this.activeUserGoals);
    return this.activeUserGoals;
  }

  removeGoal(goal : string) {
    // todo: push to database
    if(goal === 'textGoal'){
      this.activeUserGoals['textGoals'] = undefined;
    }
    else{
      // TODO: nope; we want to make a copy and make the old one the active one
      this.activeUserGoals['goals'].splice(this.activeUserGoals['goals'].indexOf(goal), 1);
    }
  }

  editTextGoal(newGoal : string){
    // todo: push to database
    this.activeUserGoals['textGoals'] = newGoal;
  }


  getActiveGoals() : {[goalAspect:string]: any}{
    if(Object.keys(this.activeUserGoals).length > 0){
      return this.activeUserGoals;
    }
    return this.getExampleGoal(); //todo: remove, use db
   // return {};
  }


  getTrackedData() : {[trackedData:string]: any;}[]{
    // todo!
    console.log(this.trackedData);
    if(this.trackedData.length > 0){
      return this.trackedData;
    }
    else{
      return this.getExamplePreviouslyTracked();
      // return [];
    }
  }


  getExamplePreviouslyTracked() : {[trackedData:string]: any;}[] {
    return [
      {
        "allDay": "true",
        "dateTracked": "2019-01-22T06:52:00.000Z",
        "Contributors": {
          "stressToday": "None",
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "15:23",
          "exerciseToday": 4
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "14:41",
            "end": "23:56"
          },
          "peakMigraineSeverity": 3,
          "migraineToday": "Yes",
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-01-22T00:00:00.000Z",
        "endTime": "2019-01-23T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-11T23:48:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "00:13",
          "exerciseToday": 9,
          "asNeededMeds": "No"
        },
        "Symptoms": {
          "migraineToday": "No",
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-02-11T00:00:00.000Z",
        "endTime": "2019-02-12T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-16T06:30:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "00:58",
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "migraineToday": "Yes",
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "Some"
        },
        "startTime": "2019-02-16T00:00:00.000Z",
        "endTime": "2019-02-17T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-03T00:39:00.000Z",
        "Contributors": {
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "18:40",
          "exerciseToday": 10,
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "peakMigraineSeverity": 4,
          "migraineToday": "No",
          "headacheToday": "Yes"
        },
        "Other": {},
        "startTime": "2019-02-03T00:00:00.000Z",
        "endTime": "2019-02-04T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-12T15:07:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "None",
          "caffeineToday": "Some"
        },
        "Treatments": {
          "exerciseToday": 13,
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "03:00",
            "end": "20:55"
          },
          "peakMigraineSeverity": 4,
          "migraineToday": "Yes",
          "headacheToday": "Yes"
        },
        "Other": {},
        "startTime": "2019-02-12T00:00:00.000Z",
        "endTime": "2019-02-13T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-21T18:16:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "None",
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "18:25",
          "exerciseToday": 6,
          "asNeededMeds": "No"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "03:19",
            "end": "10:46"
          },
          "peakMigraineSeverity": 8,
          "migraineToday": "No"
        },
        "Other": {
          "whetherMedsWorked": "Some"
        },
        "startTime": "2019-01-21T00:00:00.000Z",
        "endTime": "2019-01-22T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-01T22:10:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "02:23",
          "exerciseToday": 18
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "23:58",
            "end": "23:58"
          },
          "peakMigraineSeverity": 4,
          "migraineToday": "No",
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-03-01T00:00:00.000Z",
        "endTime": "2019-03-02T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-04T10:46:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "caffeineToday": "Some"
        },
        "Treatments": {
          "custom_timetookadvil": "19:43",
          "exerciseToday": 12,
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "09:20",
            "end": "13:58"
          },
          "peakMigraineSeverity": 8,
          "migraineToday": "No",
          "headacheToday": "Yes"
        },
        "Other": {},
        "startTime": "2019-02-04T00:00:00.000Z",
        "endTime": "2019-02-05T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-15T00:02:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "caffeineToday": "Some"
        },
        "Treatments": {
          "custom_timetookadvil": "11:24",
          "exerciseToday": 18
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "04:14",
            "end": "13:48"
          },
          "peakMigraineSeverity": 6,
          "migraineToday": "No",
          "headacheToday": "No"
        },
        "Other": {},
        "startTime": "2019-01-15T00:00:00.000Z",
        "endTime": "2019-01-16T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-08T16:20:00.000Z",
        "Contributors": {
          "stressToday": "None",
          "caffeineToday": "Some"
        },
        "Treatments": {
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "23:56",
            "end": "23:59"
          },
          "peakMigraineSeverity": 8,
          "migraineToday": "Yes",
          "headacheToday": "No"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-03-08T00:00:00.000Z",
        "endTime": "2019-03-09T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-23T02:34:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "Some",
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "02:58",
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "12:55",
            "end": "12:57"
          },
          "peakMigraineSeverity": 7,
          "migraineToday": "No",
          "headacheToday": "No"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-03-23T00:00:00.000Z",
        "endTime": "2019-03-24T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-03T02:41:00.000Z",
        "Contributors": {
          "stressToday": "Some",
          "caffeineToday": "Some"
        },
        "Treatments": {
          "custom_timetookadvil": "17:39",
          "exerciseToday": 8,
          "asNeededMeds": "No"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "11:47",
            "end": "22:49"
          },
          "peakMigraineSeverity": 4,
          "migraineToday": "No",
          "headacheToday": "Yes"
        },
        "Other": {},
        "startTime": "2019-02-03T00:00:00.000Z",
        "endTime": "2019-02-04T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-28T22:26:00.000Z",
        "Contributors": {
          "stressToday": "None",
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "15:15",
          "exerciseToday": 2,
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "19:25",
            "end": "21:37"
          },
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "Some"
        },
        "startTime": "2019-03-28T00:00:00.000Z",
        "endTime": "2019-03-29T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-10T16:08:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "None",
          "caffeineToday": "Some"
        },
        "Treatments": {
          "asNeededMeds": "No"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "16:50",
            "end": "20:51"
          },
          "peakMigraineSeverity": 3,
          "migraineToday": "Yes",
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "Some"
        },
        "startTime": "2019-03-10T00:00:00.000Z",
        "endTime": "2019-03-11T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-23T23:04:00.000Z",
        "Contributors": {
          "caffeineToday": "None"
        },
        "Treatments": {},
        "Symptoms": {
          "custom_migraineduration": {
            "start": "17:09",
            "end": "23:41"
          },
          "peakMigraineSeverity": 7,
          "migraineToday": "No",
          "headacheToday": "No"
        },
        "Other": {
          "whetherMedsWorked": "Some"
        },
        "startTime": "2019-03-23T00:00:00.000Z",
        "endTime": "2019-03-24T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-02T02:26:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "Some",
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "04:50",
          "exerciseToday": 15
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "07:34",
            "end": "23:57"
          },
          "peakMigraineSeverity": 3,
          "migraineToday": "Yes",
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-03-02T00:00:00.000Z",
        "endTime": "2019-03-03T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-19T18:25:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "None",
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "09:57",
          "exerciseToday": 18,
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "10:56",
            "end": "11:59"
          },
          "peakMigraineSeverity": 5,
          "migraineToday": "Yes",
          "headacheToday": "No"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-03-19T00:00:00.000Z",
        "endTime": "2019-03-20T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-28T00:12:00.000Z",
        "Contributors": {
          "stressToday": "Some",
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "21:24",
          "exerciseToday": 13,
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "00:47",
            "end": "05:55"
          },
          "migraineToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-02-28T00:00:00.000Z",
        "endTime": "2019-03-01T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-12T21:11:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "Some",
          "caffeineToday": "Some"
        },
        "Treatments": {
          "custom_timetookadvil": "03:17",
          "exerciseToday": 5
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "20:32",
            "end": "23:41"
          },
          "peakMigraineSeverity": 9,
          "migraineToday": "No"
        },
        "Other": {},
        "startTime": "2019-01-12T00:00:00.000Z",
        "endTime": "2019-01-13T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-02T19:40:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "None",
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "08:39",
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "11:54",
            "end": "15:59"
          },
          "peakMigraineSeverity": 8,
          "migraineToday": "No",
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "Some"
        },
        "startTime": "2019-03-02T00:00:00.000Z",
        "endTime": "2019-03-03T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-21T23:40:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "Some"
        },
        "Treatments": {
          "custom_timetookadvil": "17:04",
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "06:15",
            "end": "13:24"
          },
          "peakMigraineSeverity": 7,
          "migraineToday": "Yes",
          "headacheToday": "No"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-03-21T00:00:00.000Z",
        "endTime": "2019-03-22T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-22T16:34:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "Some",
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "21:35",
          "exerciseToday": 0
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "16:54",
            "end": "22:59"
          },
          "migraineToday": "Yes",
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-02-22T00:00:00.000Z",
        "endTime": "2019-02-23T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-15T19:22:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "None",
          "caffeineToday": "None"
        },
        "Treatments": {},
        "Symptoms": {
          "migraineToday": "Yes",
          "headacheToday": "Yes"
        },
        "Other": {},
        "startTime": "2019-03-15T00:00:00.000Z",
        "endTime": "2019-03-16T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-25T14:45:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "Some",
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "03:45",
          "exerciseToday": 11,
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "10:23",
            "end": "15:35"
          },
          "peakMigraineSeverity": 8,
          "migraineToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-02-25T00:00:00.000Z",
        "endTime": "2019-02-26T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-25T00:31:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "Some",
          "caffeineToday": "None"
        },
        "Treatments": {
          "exerciseToday": 16,
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "22:58",
            "end": "23:59"
          },
          "peakMigraineSeverity": 1,
          "migraineToday": "Yes",
          "headacheToday": "No"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-03-25T00:00:00.000Z",
        "endTime": "2019-03-26T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-09T22:15:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "Some",
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "00:34",
          "exerciseToday": 5
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "07:47",
            "end": "21:54"
          },
          "migraineToday": "Yes",
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "Some"
        },
        "startTime": "2019-03-09T00:00:00.000Z",
        "endTime": "2019-03-10T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-01-08T12:25:00.000Z",
        "Contributors": {
          "stressToday": "Some",
          "caffeineToday": "Some"
        },
        "Treatments": {
          "custom_timetookadvil": "07:14",
          "exerciseToday": 9,
          "asNeededMeds": "No"
        },
        "Symptoms": {
          "peakMigraineSeverity": 6
        },
        "Other": {
          "whetherMedsWorked": "Some"
        },
        "startTime": "2019-01-08T00:00:00.000Z",
        "endTime": "2019-01-09T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-15T10:52:00.000Z",
        "Contributors": {
          "stressToday": "None",
          "caffeineToday": "None"
        },
        "Treatments": {
          "exerciseToday": 18,
          "asNeededMeds": "No"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "15:20",
            "end": "21:49"
          },
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "Some"
        },
        "startTime": "2019-02-15T00:00:00.000Z",
        "endTime": "2019-02-16T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-17T06:46:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "Some",
          "caffeineToday": "Some"
        },
        "Treatments": {
          "custom_timetookadvil": "17:14"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "10:10",
            "end": "10:14"
          },
          "peakMigraineSeverity": 2,
          "migraineToday": "Yes",
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-02-17T00:00:00.000Z",
        "endTime": "2019-02-18T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-02-26T20:51:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "None",
          "caffeineToday": "Some"
        },
        "Treatments": {
          "custom_timetookadvil": "22:52",
          "exerciseToday": 8,
          "asNeededMeds": "Yes"
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "01:46",
            "end": "13:50"
          },
          "peakMigraineSeverity": 1,
          "migraineToday": "Yes",
          "headacheToday": "No"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-02-26T00:00:00.000Z",
        "endTime": "2019-02-27T00:00:00.000Z"
      },
      {
        "allDay": "true",
        "dateTracked": "2019-03-04T20:50:00.000Z",
        "Contributors": {
          "frequentMedUse": null,
          "stressToday": "Some",
          "caffeineToday": "None"
        },
        "Treatments": {
          "custom_timetookadvil": "06:17",
          "exerciseToday": 17
        },
        "Symptoms": {
          "custom_migraineduration": {
            "start": "13:53",
            "end": "22:59"
          },
          "peakMigraineSeverity": 7,
          "headacheToday": "Yes"
        },
        "Other": {
          "whetherMedsWorked": "None"
        },
        "startTime": "2019-03-04T00:00:00.000Z",
        "endTime": "2019-03-05T00:00:00.000Z"
      }
    ]
  }


  getExampleGoal()  : {[goalAspect:string]: any;}{
    let exGoal = {
        "goals": [
          "1",
          "2",
          "3",
          "1a",
          "1b",
          "1c",
          "3a",
          "3b"
        ],
        "dataToTrack": {
          "Changes": [
            {
              "name": "Increasing Sleep",
              "id": "sleepToday",
              "explanation": "How much sleep you got today",
              "fieldDescription": "Hours of sleep",
              "field": "number",
              "goal": {
                "freq": "More",
                "threshold": 8,
                "timespan": "Day"
              },
              "recommendingGoals": [
                "1c"
              ],
              "opts": {
                "showBackdrop": true,
                "enableBackdropDismiss": true
              },
              "selected": true
            }
          ],
          "Symptoms": [
            {
              "name": "Migraine today",
              "id": "migraineToday",
              "explanation": "Migraine experienced today",
              "fieldDescription": "Whether you had a migraine (yes/no)",
              "field": "binary",
              "recommendingGoals": [
                "1a",
                "1b",
                "1c",
                "2",
                "3a",
                "3b",
                "3c"
              ],
              "opts": {
                "showBackdrop": true,
                "enableBackdropDismiss": true
              },
              "selected": true
            },
            {
              "name": "Quality of the Pain",
              "id": "painQuality",
              "explanation": "What the pain was like (pulsating/throbbing, pressure, tension, stabbing, sharp, dull, burning, other)",
              "fieldDescription": "Text box where you can describe the pain",
              "field": "note",
              "recommendingGoals": [
                "3b"
              ],
              "opts": {
                "showBackdrop": true,
                "enableBackdropDismiss": true
              },
              "selected": true
            },
            {
              "name": "Start time",
              "id": "migraineStartTime",
              "explanation": "The time your migraine started",
              "fieldDescription": "time",
              "field": "time",
              "recommendingGoals": [],
              "opts": {
                "showBackdrop": true,
                "enableBackdropDismiss": true
              },
              "selected": true
            },
            {
              "name": "Migraine duration",
              "field": "time range",
              "id": "custom_migraineduration",
              "custom": true
            }
          ],
          "Treatments": [
            {
              "name": "As-needed medications today",
              "id": "asNeededMeds",
              "explanation": "Any medication you take on an as-needed basis (in response to symptoms).  For example: Advil, Excedrin, Tylenol, prescription medications you don't take regularly.",
              "fieldDescription": "Whether you took any as-needed medication today",
              "field": "binary",
              "recommendingGoals": [
                "1a",
                "1b",
                "1c",
                "2",
                "3a",
                "3b",
                "3c"
              ],
              "goal": {
                "freq": "Less",
                "threshold": 4,
                "timespan": "Month"
              },
              "opts": {
                "showBackdrop": true,
                "enableBackdropDismiss": true
              },
              "selected": true
            },
            {
              "name": "Exercise",
              "id": "exerciseToday",
              "explanation": "How much you exercised today",
              "fieldDescription": "Number of minutes of exercise",
              "field": "number",
              "goal": {
                "freq": "More",
                "threshold": 180,
                "timespan": "Week"
              },
              "recommendingGoals": [
                "1b",
                "3b"
              ],
              "opts": {
                "showBackdrop": true,
                "enableBackdropDismiss": true
              },
              "selected": true
            },
            {
              "name": "Nutrition Today",
              "id": "nutritionToday",
              "explanation": "Whether you ate healthily today. For example, we recommend 4-5 servings of veggies, eating regular meals, avoiding sugar",
              "fieldDescription": "Whether you ate healthily (yes/no)",
              "field": "binary",
              "recommendingGoals": [
                "1b",
                "3b"
              ],
              "opts": {
                "showBackdrop": true,
                "enableBackdropDismiss": true
              },
              "selected": true
            },
            {
              "name": "Time took advil",
              "field": "time",
              "id": "custom_timetookadvil",
              "custom": true
            }
          ],
          "Contributors": [
            {
              "name": "Stress",
              "id": "stressToday",
              "explanation": "How stressed you were today",
              "fieldDescription": "3-point stress rating",
              "significance": "High stress levels can lead to more migraines",
              "field": "category scale",
              "recommendingGoals": [
                "1b",
                "3b"
              ],
              "opts": {
                "showBackdrop": true,
                "enableBackdropDismiss": true
              },
              "selected": true
            },
            {
              "name": "Frequent Use of Medications",
              "id": "frequentMedUse",
              "explanation": "Calculated medication use, to let you know if you might want to think about cutting back.",
              "fieldDescription": "Number of pills you took",
              "field": "calculated medication use",
              "condition": true,
              "recommendingGoals": [
                "1a",
                "1b",
                "1c",
                "2",
                "3a",
                "3b",
                "3c"
              ],
              "goal": {
                "freq": "Less",
                "threshold": 4,
                "timespan": "Month"
              },
              "significance": "If you use as-needed medications too frequently, they can start causing more migraines.",
              "opts": {
                "showBackdrop": true,
                "enableBackdropDismiss": true
              },
              "selected": true
            },
            {
              "name": "Alcohol",
              "id": "alcoholToday",
              "explanation": "How much alcohol you had today",
              "fieldDescription": "3-point alcohol rating",
              "field": "category scale",
              "recommendingGoals": [
                "1b",
                "3b"
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
              "name": "Other notes",
              "id": "otherNotes",
              "explanation": "Anything else you want to note about today ",
              "fieldDescription": "Text box where you can record any notes",
              "field": "note",
              "recommendingGoals": [
                "1a",
                "1b",
                "1c",
                "2",
                "3a",
                "3b",
                "3c"
              ],
              "opts": {
                "showBackdrop": true,
                "enableBackdropDismiss": true
              },
              "selected": true
            }
          ]
        },
        "textGoals": [
          "Get <1 migraine per week"
        ],
        "dateAdded": "2019-04-11T16:22:17.264Z",
        "notificationSettings": {
          "retroactive": {
            "delayScale": "Day",
            "delayNum": 1
          }
        },
      };
    this.activeUserGoals = exGoal;
    return exGoal;
  }






}
