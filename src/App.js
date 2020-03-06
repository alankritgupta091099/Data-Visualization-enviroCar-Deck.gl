/// app.js
import React from 'react';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {StaticMap} from 'react-map-gl';
//import { MapStylePicker } from 'controls';

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.REACT_MAPBOX_ACCESS_TOKEN;

// Initial viewport settings
const initialViewState = {
  longitude: 6.4847174678758375,
  latitude: 51.22546715521443,
  zoom: 15,
  pitch: 0,
  bearing: 0
};

export default class App extends React.Component {
  //initial state
  state = {
    data:[],
    cords:[],
    style: 'mapbox://styles/mapbox/light-v9'
  };

  //fetch data from api
  async componentDidMount(){
    const url="https://envirocar.org/api/stable/measurements";
    const response = await fetch(url);
    const data = await response.json();
    this.setState({data:data})
    this.getPoints();    
  }

  //function to extract cordinates from data
  getPoints = () => {
    const cords=[];
    const data=this.state.data.features;
    data.forEach((d)=>{
      cords.push({'lat':d.geometry.coordinates[1],'long':d.geometry.coordinates[0]})
    })
    console.log(process.env.REACT_MAPBOX_ACCESS_TOKEN);
    this.setState({cords:cords});
  }
  //toggle styles
  onStyleChange = style => {
    this.setState({ style });
  };
  // layers = [
  //   new LineLayer({id: 'line-layer', data})
  // ];
  renderLayers = (props) => {
      const {cords} = props;
      console.log(cords)
      return new ScatterplotLayer({
        id: 'scatterplot',
        data:cords,
        getPosition: d => [d.long,d.lat],
        getColor: d => [0, 128, 255],
        getRadius: d => 50,
        opacity: 0.5,
        pickable: true,
        radiusMinPixels: 0.25,
        radiusMaxPixels: 30,
      })
  }
  render() {
    return (
      <DeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={this.renderLayers({cords:this.state.cords})}
      >
        <StaticMap 
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} style={this.state.style}
        />
      </DeckGL>
    );
  }
}