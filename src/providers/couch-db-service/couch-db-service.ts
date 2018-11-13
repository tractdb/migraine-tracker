import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class CouchDbServiceProvider {

  private baseUrl = 'https://tractdb.org/api';
  private currentUser = null;

  constructor(public http: HttpClient) {
  }

  login(credentials) {
    // log the user in based on the credentials
    credentials = {'account': 'migraine_test', 'password': 'test'};
    return this.http.post(this.baseUrl + '/login', JSON.stringify(credentials));
  }

  userLoggedIn() {
    // see if we're logged in; not working despite logging in hypothetically working.
    // if(this.currentUser === null) { //bs because the below isn't working to tet login
    //   this.currentUser = true;
    //   return false;
    // }
    return true;

    // this.http.get(this.baseUrl + '/authenticated').subscribe(
    //   data => {
    //     console.log(data);
    //     return true;
    //   }, error => {
    //     console.log(error);
    //     return false;
    // });
  }

  getActiveTrackingFields() {
    // should return all fields that the user is actively tracking
  }

  trackData(newData) {
    // should store a datapoint in couch as a new object
  }

  addGoal(goal) {
    // should store a new goal by modifying the goal document
  }

  getGoals () {
    // should return all goals, or [] if they don't have any
    return [];
  }

  getActiveGoals () {
    // should return all active goals
    return this.getGoals().filter(goal => goal.deactivated === null);
  }

  deactivateGoal(goalsToDeactivate) {
    // should mark goal(s) as deactivated by going through and adding deactivated date
    // 1) get goal document; 2) modify goal document; 3) put goal document

    // for (let i=0; i<this.currentUser.goals.length; i++){
    //   if (goalsToDeactivate.includes(this.currentUser.goals[i])){
    //     this.currentUser.goals[i]["deactivated"] = new Date();
    //   }
    // }
  }


  addTrackingField(field) {
    // adds a field to track to the "active fields" list
    // dunno what goal to associate it with, if they have multiple; probably need to ask
    // or maybe we don't make that explicit?

  }

  removeFieldFromArray(field, array) {
    // helper function
    const index = array.indexOf(field);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

  removeTrackingField(field) {
    // removes a field from the list of fields to track
    // will have to go in and remove it from every goal, as well as the list of active fields?
    // or maybe we just don't keep a separate list of active fields?

    // this.removeFieldFromArray(field, this.currentUser.activeTrackingFields);
    // for (let i=0; i<this.currentUser.goals.length; i++) {
    //   //todo: double check that the array is actually modified
    //   this.removeFieldFromArray(field, this.currentUser.goals[i].fields);
    // }
  }

}
