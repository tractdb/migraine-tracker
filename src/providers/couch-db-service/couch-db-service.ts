import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the CouchDbServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CouchDbServiceProvider {

  currentUser;

  constructor(public http: HttpClient) {
    // obviously won't be here when we can actually log in
    this.currentUser = {
      "activeTrackingFields": [],
      "goals": [],
      "data": [],
    };
  }

  login(userName, password) {
    // logs in
    this.currentUser["name"] = userName;
    console.log(this.currentUser);

  }

  userLoggedIn() {
    // see if we're logged in
    return !!this.currentUser;
  }

  userHasGoal() {
    // should return whether a user has set up a goal (http get probably)
    return this.userLoggedIn() && this.currentUser.goals.length > 0;
  }

  getActiveTrackingFields() {
    // should return all fields that the user is actively tracking (http get)
    return this.currentUser.activeTrackingFields;
  }

  trackData(newData) {
    // should store tracked data (http put)
    this.currentUser.goals.push(newData);
  }

  addGoal(goal) {
    // should store a new goal (http put)
    // question: better to store pieces as user sets up or wait until the end?

    // needs to add date activated
    goal["activated"] = new Date();
    this.currentUser.goals.push(goal);
  }

  getGoals () {
    // should return all goals
    return this.currentUser.goals;
  }

  deactivateGoal(goal) {
    // deactivates a goal; probably just takes the goal
    for (let i=0; i<this.currentUser.goals.length; i++){
      if (this.currentUser.goals[i].id === goal){
        this.currentUser.goals[i]["deactivated"] = new Date();
      }
    }
  }


  addTrackingField(field) {
    // adds a field to track
    // dunno what goal to associate it with, if they have multiple; probably need to ask
    // or maybe we don't make that explicit?
    this.currentUser.activeTrackingFields.push(field)
  }

  removeFieldFromArray(field, array) {
    const index = array.indexOf(field);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

  removeTrackingField(field) {
    // removes a field from the list of fields to track
    // will have to go in and remove it from every goal, probably
    this.removeFieldFromArray(field, this.currentUser.activeTrackingFields);

    for (let i=0; i<this.currentUser.goals.length; i++) {
      //todo: double check that the array is actually modified
      this.removeFieldFromArray(field, this.currentUser.goals[i].fields);
    }
  }
  
}
