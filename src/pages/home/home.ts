import { Component } from '@angular/core';
import {ModalController, NavController, NavParams} from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GoalTypePage} from "../addGoal/goal-type/goal-type";
import {LoginPage} from "../login/login";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";
import {AddCustomDataPage} from "../addGoal/add-custom-data/add-custom-data";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private goals = [];

  constructor(public navCtrl: NavController,
              private couchDbService: CouchDbServiceProvider,
              public navParams: NavParams,
              private globalFunctions: GlobalFunctionsServiceProvider,
              private modalCtrl: ModalController){
  }

  login() {
    let customDataModal = this.modalCtrl.create(LoginPage);
    customDataModal.onDidDismiss(() => {
      this.goals = this.couchDbService.getActiveGoals();
    });
    customDataModal.present();
  }

  addGoal() {
    this.navCtrl.push(GoalTypePage);
  }

  ionViewDidEnter(){
    if(this.navParams.data.configPath){
      this.goals = this.globalFunctions.getAllGoalsAndSubgoals(this.navParams.data.configPath);
    }
    else{
      this.couchDbService.userLoggedIn().subscribe(
        resp => {
          this.goals = this.couchDbService.getActiveGoals();
          console.log(resp);
        }, error => {
          console.log(error);
          this.login();
        });
    }

  }


}
