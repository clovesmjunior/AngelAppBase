
var socket = io.connect('http://'+getHostName()+':9595');

function getHostName(){
  var url = window.location.hostname;
  var arr = url.split(":");
  return arr[0];
}

var JobBox = React.createClass({
  loadJobsFromServer: function() {
    /*$.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
      	console.log(data);
        this.setState({data:data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });*/
  var objFather = this;
    socket.on('job_list', function(msg){
      console.log(msg);
      objFather.setState({data:msg});
      //this.loadJobsFromServer();
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadJobsFromServer();    
    //setInterval(, this.props.pollInterval);
  },
  render: function() {  	 
  	 var valueState = (this.state.data instanceof Array)?this.state.data:JSON.parse(this.state.data);
    return (
      <div className="jobBox">
        <h1>List of Jobs</h1>

        <JobsList data={valueState} />
      </div>
    );
  }
});


var JobsList = React.createClass({
  render: function() {
    var jobNodes = this.props.data.map(function(varJob) {
      console.log(varJob);
      return (
        <Job title={varJob._source.title} key={varJob._id}>{varJob._source.title} - {varJob._source.angellist_url}</Job>
      );
    });
    return (
      <div className="jobList">
        {jobNodes}
      </div>
    );
  }
});

var Job = React.createClass({
  rawMarkup: function() {
    console.log(this.props);
    if(this.props.children!=null){
      var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    }else{
      var rawMarkup = marked(this.toString(), {sanitize: true});
    }
    return { __html: rawMarkup };
  },

  render: function() {
    return (
      <div className="job">
        <h2 className="jobDefine">
          {this.props.title}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

React.render(
<JobBox url="/api/list" pollInterval={60000} />,
document.getElementById('content')
);