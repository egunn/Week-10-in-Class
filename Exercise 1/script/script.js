/**
 * Created by siqi on 11/10/15.
 */
var margin = {t:50,r:50,b:50,l:50},
    width = document.getElementById('map').clientWidth - margin.l - margin.r,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;

var map = d3.select('.canvas')
    .append('svg')
    .attr('width',width+margin.l+margin.r)
    .attr('height',height+margin.t+margin.b)
    .append('g').attr('class','map')
    .attr('transform','translate('+margin.l+','+margin.t+')');

var lngLatBoston = [-71.0589,42.3601],
    lngLatSF = [-122.4167,37.7833];

//turns an earth coordinate into a screen coordinate. Need to define origins using .center and .translate attributes
//tell it what the center point is
var albersUsaProjection = d3.geo.albersUsa()  //albersUsaProjection([-71.0589,42.3601]) now returns screen coords for a lat/long pair
    //.center() //some long/lat of center point - predefined for Albers USA cannot define another
    .translate([width/2, height/2]); //[array] with x and y coordinate to match center point to.

//use invert function to convert screen (mouse) positions back to long/lat (see lecture slides)

var path = d3.geo.path() //this is a generator function!! Takes geographic info in geoJSON and converts to shapes on page
    .projection(albersUsaProjection); //only need to specify projection to use

//draw path elements on page to represent geographic boundaries - use d3.geo.path to create list of points. All it needs
//is the projection needed to associate geographic data to screen data.

//import GeoJSON data
//d3.json('location of the json file', function(){}); //no parsing function - just a callback. Native Javascript, so all vars already exist
//(in csv, start as strings and have to be parsed.)

queue()
    .defer(d3.json, "data/gz_2010_us_040_00_5m.json") //geoJSON features for counties in US
    .defer(d3.json, "data/gz_2010_us_050_00_5m.json") //feature collection of all states in US
    .await(function(err, states, counties){
        console.log(states);
        //console.log(counties);


        //TODO: set up a projection of all states and counties using albers US projection

       /* map.selectAll('.state')
            .data(states.features) //states is an object, states.features is an array w/ 52 elements. Use enter/exit/update to join and create DOM elements
            .enter()
            .append('path').attr('class','state')
            .attr('d', path);*/  //use this method if you need to interact with things individually

        map.append('path')
            .datum(counties)
            .attr('class','counties')
            .attr('d',path);  //do it this way if you just need the block of states for context (faster because fewer things to render)

        map.append('circle').attr('class','city')
            .attr('cx',albersUsaProjection(lngLatBoston)[0]) //grabbing first array value returned by the albersUsaprojection using lnglatBoston
            .attr('cy',albersUsaProjection(lngLatBoston)[1])
            .attr('r', 5);

        map.append('circle').attr('class','city')
            .attr('cx',albersUsaProjection(lngLatSF)[0]) //grabbing first array value returned by the albersUsaprojection using lnglatBoston
            .attr('cy',albersUsaProjection(lngLatSF)[1])
            .attr('r', 5);



        map.append('line').attr('class','line')
            .attr('x1', albersUsaProjection(lngLatBoston)[0])
            .attr('x2',albersUsaProjection(lngLatSF)[0])
            .attr('y1',albersUsaProjection(lngLatBoston)[1])
            .attr('y2',albersUsaProjection(lngLatSF)[1]);

        //path generator function will convert a line to a curve that represents that line on a 2D map.
        //create a new geoJSON object
        var lineFeature = {
            type: 'Feature',
            geometry: {
                type:'LineString',
                coordinates:[lngLatBoston,lngLatSF]
            },
            properties:{}
        };

        map.append('path').attr('class','line')
            .attr('d', path(lineFeature));

        //TODO: create a geo path generator



        //TODO: draw polygon, line, point
    });

function redraw(){
}
