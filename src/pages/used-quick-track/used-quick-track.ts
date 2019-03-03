import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';

/**
 * Generated class for the UsedQuickTrackPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-used-quick-track',
  templateUrl: 'used-quick-track.html',
})
export class UsedQuickTrackPage {

  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams,
              ) {
  }

  ionViewDidLoad() {

  }

  closeModal(dismissal){
    this.viewCtrl.dismiss(dismissal);
  }

}
