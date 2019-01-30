import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {DataConfigPage} from "../data-config/data-config";

/**
 * Generated class for the EnterTextGoalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-enter-text-goal',
  templateUrl: 'enter-text-goal.html',
})
export class EnterTextGoalPage {

  private textGoals;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

  continueSetup() {
    this.navParams.data['textGoals'] = this.textGoals;
    this.navParams.data['dataToConfigure'] = "Symptoms";
    this.navCtrl.push(DataConfigPage, this.navParams.data);
  }

}
