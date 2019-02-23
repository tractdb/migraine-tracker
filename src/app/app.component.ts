import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { HomePage } from '../pages/home/home';
import {GoalModificationPage} from "../pages/goal-modification/goal-modification";
import {TrackingModificationPage} from "../pages/tracking-modification/tracking-modification";
import {CouchDbServiceProvider} from "../providers/couch-db-service/couch-db-service";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
              private couchDBService: CouchDbServiceProvider) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    if(Object.keys(this.couchDBService.getActiveGoals()).length === 0){
      // todo: add FAQ page
      this.pages = [
        { title: 'Home', component: HomePage},
      ];
    }
    else{
      this.pages = [
        { title: 'Home', component: HomePage},
        { title: 'Goals', component: GoalModificationPage},
        { title: 'Tracking Routine', component: TrackingModificationPage},
      ];
    }

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
