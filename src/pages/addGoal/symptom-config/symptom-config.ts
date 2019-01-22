import { Component } from '@angular/core';
import {ModalController, NavController, NavParams } from 'ionic-angular';
import {DataDetailsServiceProvider} from "../../../providers/data-details-service/data-details-service";
import {AddCustomDataPage} from "../add-custom-data/add-custom-data";

/**
 * Generated class for the SymptomConfigPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-symptom-config',
  templateUrl: 'symptom-config.html',
})
export class SymptomConfigPage {

  private recommendations = [];
  private customSymptoms = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public dataDetailsServiceProvider: DataDetailsServiceProvider,
              public modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    let goals = this.navParams.data['selectedGoals'];
    for(let i=0; i<goals.length; i++){
      let recs = this.dataDetailsServiceProvider.getRecommendations(goals[i], "Symptoms");
      if (recs.length > 0){
        this.recommendations.push({"goal": goals[i], "recommended": recs});
      }
    }

  }

  continueSetup() {
    // todo: maybe we should have pushed goals to couch by now
    // todo: deal with "track a change" edge cases
    // todo: figure out whether/how they can change scales
    console.log("continue");
    // this.navCtrl.push(TrigerConfigPage, this.navParams.data);
  }

  addCustomSymptom() {
    // todo: go to a custom page

    let customDataModal = this.modalCtrl.create(AddCustomDataPage, {"type": "Symptoms"});
    customDataModal.onDidDismiss(data => {
      console.log(data);
    });
    customDataModal.present();

    // this.navCtrl.push(AddCustomDataPage, "Symptoms");
  }

}
