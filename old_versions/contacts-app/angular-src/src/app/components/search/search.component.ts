import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { ValidateService } from '../../services/validate.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  submitted:boolean;
  contact:Object;
  searchInput: String;
  dataInput: String;

  constructor(
    private validateService: ValidateService,
    private authService:AuthService,
    private router: Router,
    private flashMessage: FlashMessagesService) { }

  ngOnInit() {
    this.submitted = false;
  }

  onFindSubmit() {

    const query = this.searchInput;

    this.authService.findContacts(query).subscribe(getcontacts => {
      let datatable = getcontacts.contacts;
      this.dataInput = "";
      for(var i = 0; i < datatable.length(); i++){
        this.dataInput += datatable[i];
      }
      if (this.dataInput == ""){
        this.dataInput = "<p>Nothing Found.</p>";
      }
      this.dataInput = datatable;
    },
     err => {
       console.log(err);
       return false;
     });
     //this.submitted = true;
     //this.searchForm.reset();
  }

}
