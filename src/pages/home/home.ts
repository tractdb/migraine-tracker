import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GoalTypePage} from "../addGoal/goal-type/goal-type";
import {LoginPage} from "../login/login";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private goals = [];


  constructor(public navCtrl: NavController,
              private couchDbService: CouchDbServiceProvider){

  }

  addGoal() {
    this.navCtrl.push(GoalTypePage);
  }

  ionViewDidEnter(){
    if(!this.couchDbService.userLoggedIn()){
      this.navCtrl.push(LoginPage);
    }
    else{
      this.goals = this.couchDbService.getActiveGoals();
    }
  }


}
