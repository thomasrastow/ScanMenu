import React, {Component} from 'react';
import ReactNative from 'react-native';
import {Actions} from 'react-native-router-flux';
import * as firebase from 'firebase';
import RNFetchBlob from 'react-native-fetch-blob';
import Camera from 'react-native-camera';
import { Icon } from 'react-native-elements';
import StatusBar from './StatusBar';
import styles from '../styles';
const {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  View,
  KeyboardAvoidingView,
  TouchableHighlight
} = ReactNative;
const fs = RNFetchBlob.fs;
const Blob = RNFetchBlob.polyfill.Blob;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

class CameraPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      path: null,
      barcode: null,
      barcodeType: null,
      productName: null,
      progress: 100
    };
    this.fireRef = firebase.storage().ref('photos');
    this.photoRef = firebase.database().ref().child('photos');
  }
  uploadPhoto() {
    let pathArray = this.state.path.split('/');
    let firename = '/'+pathArray[pathArray.length-1];
    let rnfbURI = RNFetchBlob.wrap(this.state.path);

    Blob.build(rnfbURI, { type : 'image/png;'})
    .then((blob) => {      
      var uploadTask = this.fireRef.child(firename).put(blob, { contentType : 'image/png' });
      
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
        this.setState({ progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100 });
      
        switch (snapshot.state) {
          case firebase.storage.TaskState.SUCCESS: // or 'success'
            console.log('Upload is complete');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
          default:
            console.log(snapshot.state);
        }
      }, (error) => {
        console.error(error);
      }, () => {
        this.setState({ path: null, progress: 100 });
        this.photoRef.push({ title: firename, url: uploadTask.snapshot.downloadURL });
      });
    })
    .catch(err => console.error(err));
  }
  takePicture() {
    this.camera.capture()
      .then((data) => {
        this.setState({ photo: data, path: data.path });
      })
      .catch(err => console.error(err));
  }
  renderUpload() {
    if (this.state.progress !== 100) {
      return <ActivityIndicator size='small' color='#FFF'/>;    
    }
    return <Icon 
    name='cloud-upload'
    type='material-community'
    color='#333333'
    style={styles.photoButton}
    onPress={this.uploadPhoto.bind(this)}/>;
  }
  renderCamera(){
    return (
      <Camera
        ref={(cam) => {
          this.camera = cam;
        }}
        style={styles.preview}
        aspect={Camera.constants.Aspect.fill}
        captureTarget={Camera.constants.CaptureTarget.disk}
        onBarCodeRead={this._onBarCodeRead.bind(this)}
      >
        <Icon 
          name='camera-iris'
          type='material-community'
          color='#333333'
          style={styles.capture}
          onPress={this.takePicture.bind(this)}/>
      </Camera>
    );
  }
  renderImage() {
    return (
      <View>
        <Image
          source={{ uri: this.state.path }}
          style={styles.preview}
        />
        <View style={styles.photoButtons}>
          {this.renderUpload()}
          <Icon 
              name='cancel'
              type='material-community'
              color='#333333'
              style={styles.photoButton}
              onPress={() => this.setState({ path: null })}/>
        </View>
      </View>
    );
  }
  _onBarCodeRead(e) {
    this.setState({ barcode: e.data, barcodeType: e.type }); 
  }
  renderBarCodeInfo() {
  return (
      <View>
        <Text>"Ingrdient Found!"</Text>
        <Icon 
              name='cancel'
              type='material-community'
              color='#333333'
              style={styles.photoButton}
              onPress={() => this.setState({ barcode: null, barcodeType: null })}/>
      </View>
    )
    Actions.HomePage({ barcode: e.data });
  }
  selectPage(){
    if(this.state.path){
      return this.renderImage();
    }else if(this.state.barcode){
      return this.renderBarCodeInfo();
    }else{
      return this.renderCamera();
    }
  }  
  render() {
    return (
      <View style={styles.panelContrainer}>
        {this.selectPage()}
      </View>
    )
  }
}
module.exports = CameraPage;