import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { ServicesService } from '../services.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource, Capacitor} from '@capacitor/core';



@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  @ViewChild('filePicker', {static:false})
  filePickerRef : ElementRef<HTMLInputElement>;
  isDesktop : boolean;
  name = "";
  email = "";
  imgPreview = "https://st.depositphotos.com/1779253/5140/v/600/depositphotos_51405259-stock-illustration-male-avatar-profile-picture-use.jpg";
  avatar; 

  constructor(
    private platform : Platform,
    private sanitizer : DomSanitizer,
    private navCtrl : NavController,
    private service : ServicesService,
    private router : Router
  ) {}

  ngOnInit(){
    if((this.platform.is('mobile') && this.platform.is("hybrid")) ||
    this.platform.is('desktop')){
      this.isDesktop = true;
    }

    this.service.userDetail().subscribe(res => {
      if (res !== null){
        console.log("CurrentUser:" , res.email);
        this.email = res.email;
        console.log("UserId:", this.email);
        this.getCurrUser(this.email);
        this.service.getProfilePic(this.email).subscribe((doc)=>{
          console.log(doc.data());
          let pic : any = [];
          pic = doc.data();
          if(doc.data() === {}){
            this.imgPreview = "https://st.depositphotos.com/1779253/5140/v/600/depositphotos_51405259-stock-illustration-male-avatar-profile-picture-use.jpg";
          }
          else{
            this.imgPreview = "data:image/jpeg;base64,"+ pic.pic;
          }
        })
      }
      else{
        this.navCtrl.navigateBack('/register');
      }
    })

    
  }

  logout(){
    this.service.logout().then( res => {
      console.log(res);
      this.router.navigateByUrl('/register');
    }).catch(err => {
      console.log(err);
    });
  }

  getCurrUser(email){
    let user : any = [];
    console.log(email);
    this.service.getCurrUser(email).subscribe((doc)=>{
      if(doc.exists){
        console.log(doc.data());
        user = doc.data();
        let firstName = user.firstName;
        let lastName = user.lastName;
        this.name = firstName+" "+lastName;
      }
      else {
        console.log("Document doesn't exist");
      }
    });
  }

  async getPicture(type : string){
    if(!Capacitor.isPluginAvailable('Camera') || (this.isDesktop && type === 'gallery')){
      this.filePickerRef.nativeElement.click();
      return;
    }

    const image = await Camera.getPhoto({
      quality : 100,
      width : 160,
      height : 160,
      allowEditing : false,
      resultType : CameraResultType.Base64,
      source : CameraSource.Prompt
    });

    console.log(image.base64String);

    this.service.uploadPic(this.email,image.base64String);
    this.imgPreview = "data:image/jpeg;base64,"+image.base64String;


  }



  
  



}
