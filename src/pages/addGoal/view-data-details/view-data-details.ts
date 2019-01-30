import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';

/**
 * Generated class for the ViewDataDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-view-data-details',
  templateUrl: 'view-data-details.html',
})
export class ViewDataDetailsPage {

  private dataType;
  private readonly selected;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public viewCtrl: ViewController) {
    this.dataType = navParams.data.type;
    this.selected = navParams.data.selected;
  }

  ionViewDidLoad() {
  }

  backToConfig(){
    this.viewCtrl.dismiss();
  }

}
