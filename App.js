/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar, Image, ToastAndroid, ActivityIndicator, TouchableHighlight, LogBox, ScrollView, RefreshControl
} from 'react-native';

import ImageSlider from 'react-native-image-slider';
import { moderateScale, verticalScale } from './src/utils/Scaling';
import { Fonts } from './src/utils/Fonts';
import NetInfo from "@react-native-community/netinfo";
import { ApiManager } from './src/network/ApiManager';
import AppConstants from './src/constants/AppConstants';


class App extends Component<{}> {

  constructor(props) {
    super(props);

    this.getImages = this.getImages.bind(this);
    this.getRefresh = this.getRefresh.bind(this);
    this.checkInternetConnection = this.checkInternetConnection.bind(this);

    this.state = {
      isLoading: false,
      isConnected: true,
      isApiLoadFailed: false,
      isNetworkError: false,
      refreshing: false,
      image_data: [],
    };

    this.checkInternetConnection();
  }

  /**
   * Network connection checking
   */
  checkInternetConnection() {
    try {
      NetInfo.fetch().then(state => {
        if (state !== undefined && state !== null &&
          state.type !== undefined && state.type !== null &&
          state.type !== 'none') {
          this.setState({
            isConnected: true,
          });
          this.getImages()
        } else {
          this.setState({
            isConnected: false,
          });
        }
      });
    } catch (e) {
      console.log("CheckInternetConnection error : ", e)
    }
  }

  /**
   * Loading images from api
   */
  getImages() {

    if (this.state.isConnected === false) {
      this.setState({
        isLoading: false,
        isApiLoadFailed: true,
        isNetworkError: true
      })
      return;
    }

    this.setState({
      isLoading: true,
      isApiLoadFailed: false,
      isNetworkError: false

    });

    try {
      ApiManager.getData("https://picsum.photos/list", (resp) => {

        let responseJson = resp;

        if (responseJson !== null && responseJson !== undefined && responseJson.length > 0) {

          this.setState({
            image_data: responseJson,
          })

        } else {
          ToastAndroid.show(AppConstants.NO_DATA_FOUND, ToastAndroid.SHORT);
        }

        this.setState({
          isLoading: false,
          isNetworkError: false
        });

      }, (error) => {
        this.setState({
          isLoading: false,
          isNetworkError: false
        });
        ToastAndroid.show(error.message, ToastAndroid.SHORT);
        console.log("Error : ", error.message);
      });
    } catch (e) {
      this.setState({
        isLoading: false,
        isNetworkError: false
      });
      console.log("Exception : ", e);
      ToastAndroid.show(AppConstants.SERVER_ERROR, ToastAndroid.SHORT);
    }
  }

  /**
   * Loading random images on app refresh
   */
  getRefresh() {

    let tempArray = this.state.image_data.slice();

    // Shuffle array
    const result = tempArray.sort(() => 0.5 - Math.random());

    this.setState({
      image_data: result,
      refreshing: false
    })
  }

  _onRefresh() {
    this.setState({ refreshing: true });
    console.log("Refreshing : ", true)
    this.getRefresh()
  }

  render() {
    LogBox.ignoreAllLogs(true)

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#EE4713" barStyle="light-content" />
        <ScrollView style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh.bind(this)}
            />
          }>
          <View style={styles.mainView}>
            {this.state.image_data.length > 0 ? <ImageSlider
              images={this.state.image_data}
              customSlide={({ index, item, style, width }) => (
                <View
                  key={index}
                  style={[
                    style,
                    styles.slider
                  ]}
                >
                  <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>{item.author}</Text>
                  </View>
                  <View style={styles.imageContainer}>
                    <Image style={styles.img}
                    //source={{ uri: item }}
                      source={{ uri: "https://picsum.photos/200/300?image=" + item.id }}
                      resizeMode="contain" />
                  </View>
                </View>
              )}
              customButtons={() => (
                <View />
              )}
            /> :
              <View style={styles.noDataContainer}>
                {!this.state.isLoading ? this.state.isNetworkError ? <Image style={styles.noDataImg}
                  source={require('./src/images/no_internet.png')}
                  resizeMode="contain" /> : <Image style={styles.noDataImg}
                    source={require('./src/images/no_data.png')}
                    resizeMode="contain" /> : <View />}
              </View>}
          </View>
        </ScrollView>
        {this.state.isLoading ? <ActivityIndicator
          color='#f36c41'
          size="large"
          style={styles.activityIndicator} /> : <View />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    marginTop: '10%'
  },
  mainView: {
    width: '100%',
    height: '100%'
  },
  slider: {
    backgroundColor: '#000000',
    paddingBottom: verticalScale(50)
  },
  titleContainer: {
    width: '100%',
    height: '10%',
    paddingTop: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: Fonts.regular,
    fontSize: moderateScale(13),
    color: '#ffffff'
  },
  imageContainer: {
    width: '100%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%'
  },
  img: {
    width: '100%',
    aspectRatio: 1 / 1,
  },
  noDataContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataImg: {
    width: '45%',
    height: '45%',
    marginBottom: verticalScale(30)
  },
  activityIndicator: {
    position: 'absolute',
    top: '50%',
    bottom: '50%',
    left: '50%',
    right: '50%',
    justifyContent: 'center'
  }
});

export default App;
