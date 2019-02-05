import { Component } from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
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
              private couchDbService: CouchDbServiceProvider,
              public navParams: NavParams){
  }

  addGoal() {
    this.navCtrl.push(GoalTypePage);
  }

  ionViewDidEnter(){
    if(this.navParams.data.selectedGoals){
      this.goals = this.navParams.data.selectedGoals;
    }
    else{
      this.couchDbService.userLoggedIn().subscribe(
        resp => {
          this.goals = this.couchDbService.getActiveGoals();
          console.log(resp);
        }, error => {
          console.log(error);
          this.navCtrl.push(LoginPage);
        });
    }

  }


}
