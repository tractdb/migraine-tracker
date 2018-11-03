import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GoalTypePage} from "../addGoal/goal-type/goal-type";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public hasGoal;
  public userLoggedIn;
  userName;
  password;

  constructor(public navCtrl: NavController,
              private couchDbService: CouchDbServiceProvider) {

  }

  addGoal() {
    this.navCtrl.push(GoalTypePage);
  }

  ionViewDidEnter(){
    this.hasGoal = this.couchDbService.userHasGoal();
    this.userLoggedIn = this.couchDbService.userLoggedIn();
  }


  login(formValues) {
    this.couchDbService.login(this.userName, this.password);
  }

  viewGoals() {
    console.log(this.couchDbService.getGoals())
  }

  viewFields() {
    console.log(this.couchDbService.getActiveTrackingFields());
  }



}
