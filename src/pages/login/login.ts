import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private loginInfo: FormGroup;
  private credentials = {
    'account': 'migraine_test',
    'password': 'test'
  };

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDbService: CouchDbServiceProvider,
              private formBuilder: FormBuilder) {
    this.loginInfo = this.formBuilder.group({
      account: ['', Validators.required],
      password: ['', Validators.required],
    });
  }


  login() {
    this.couchDbService.login(this.loginInfo.value).subscribe(() => {
        console.log("logged in");
        this.navCtrl.popToRoot();
      },
      error => {
        console.log(error);
      });

  }




}
