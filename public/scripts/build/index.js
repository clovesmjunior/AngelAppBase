
var socket = io.connect('http://'+getHostName()+':9595');

function getHostName(){
  var url = window.location.hostname;
  var arr = url.split(":");
  return arr[0];
}

var JobBox = React.createClass({
  loadJobsFromServer: function() {    
  var objFather = this;
    socket.on('job_list', function(msg){
      console.log(msg);
      objFather.setState({data:msg});
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  handleJobSubmit: function(job){
    var jobs = this.state.data;
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'GET',
      data: job,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: jobs});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadJobsFromServer();    
  },
  render: function() {  	 
  	 var valueState = (this.state.data instanceof Array)?this.state.data:JSON.parse(this.state.data);
    return (
      <div className="jobBox">
        <h1>Search Jobs</h1>
        <JobForm onSearchJobSubmit={this.handleJobSubmit} />
        <br />
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

var JobForm = React.createClass({
  getInitialState: function() {
    return {country: '', city: '', email: ''};
  },
  handleCountryChange: function(e) {
    this.setState({country: e.target.value});
  },
  handleCityChange: function(e) {
    this.setState({city: e.target.value});
  },
  handleEmailChange: function(e) {
    this.setState({email: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var country = this.state.country.trim();
    var city = this.state.city.trim();
    var email = this.state.email.trim();
    if (!city || !country) {
      return;
    }
    this.props.onSearchJobSubmit({country: country, city: city, email: email});
    this.setState({country: '', city: '', email: ''});
  },
  render: function() {
    return (
      <form className="jobForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Country"
          value={this.state.country}
          onChange={this.handleCountryChange}
        />
        <input
          type="text"
          placeholder="City"
          value={this.state.city}
          onChange={this.handleCityChange}
        />
        <input
          type="text"
          placeholder="E-mail"
          value={this.state.email}
          onChange={this.handleEmailChange}
        />
        <input type="submit" value="Search" />
      </form>
    );
  }
});

React.render(
<JobBox url="/api/list" />,
document.getElementById('content')
);