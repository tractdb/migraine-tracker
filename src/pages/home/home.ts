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
  private goalAddition: FormGroup;

  private goals = [];


  constructor(public navCtrl: NavController,
              private couchDbService: CouchDbServiceProvider,
              private formBuilder: FormBuilder) {
    this.loginInfo = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.goalAddition = this.formBuilder.group({
      goaltype: [''],
      fields: ['']
    });

    this.goals = this.couchDbService.getActiveGoals();

  }

  addGoal() {
    this.navCtrl.push(GoalTypePage);
  }

  ionViewDidEnter(){
    this.hasGoal = this.couchDbService.userHasGoal();
    this.userLoggedIn = this.couchDbService.userLoggedIn();
  }


  login() {
    this.couchDbService.login(this.loginInfo.value.userName, this.loginInfo.value.password);
  }

  addExGoal() {
    this.couchDbService.addGoal(this.goalAddition.value);
    this.goals = this.couchDbService.getActiveGoals();
  }

  removeExGoal (goals) {
    this.couchDbService.deactivateGoal(goals);
    this.goals = this.couchDbService.getActiveGoals();
  }

  viewActiveGoals() {
    console.log(this.couchDbService.getActiveGoals());
  }



}
