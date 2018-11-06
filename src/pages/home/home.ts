import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GoalTypePage} from "../addGoal/goal-type/goal-type";
import {Validators, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public hasGoal;
  public userLoggedIn;
  private loginInfo: FormGroup;


  constructor(public navCtrl: NavController,
              private couchDbService: CouchDbServiceProvider,
              private formBuilder: FormBuilder) {
    this.loginInfo = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });

  }

  addGoal() {
    this.navCtrl.push(GoalTypePage);
  }

  ionViewDidEnter(){
    this.hasGoal = this.couchDbService.userHasGoal();
    this.userLoggedIn = this.couchDbService.userLoggedIn();
  }


  login(formValues) {
    this.couchDbService.login(this.loginInfo.value.userName, this.loginInfo.value.password);
  }

  viewGoals() {
    console.log(this.couchDbService.getGoals())
  }

  viewFields() {
    console.log(this.couchDbService.getActiveTrackingFields());
  }



}
