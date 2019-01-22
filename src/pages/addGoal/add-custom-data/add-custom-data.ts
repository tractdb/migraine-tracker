import { Component } from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';

/**
 * Generated class for the AddCustomDataPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-add-custom-data',
  templateUrl: 'add-custom-data.html',
})
export class AddCustomDataPage {

  private dataType;
  private dataName;
  private dataField;
  private dataGoal;

  constructor(public navParams: NavParams,
              public viewCtrl: ViewController) {
    this.dataType = navParams.data.type;
  }

  ionViewDidLoad() {

  }

  backToConfig(){
      let data = { 'name': this.dataName, 'field': this.dataField, 'goal': this.dataGoal};
      this.viewCtrl.dismiss(data);
  }

}
