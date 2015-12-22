

var JobBox = React.createClass({
  loadJobsFromServer: function() {
    $.ajax({
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
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadJobsFromServer();
    setInterval(this.loadJobsFromServer, this.props.pollInterval);
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
      return (
        <Job title={varJob.title} key={varJob.id}>{varJob.title}</Job>
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
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
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