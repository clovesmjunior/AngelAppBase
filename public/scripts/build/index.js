
var socket = io.connect('http://'+getHostName()+':9595');
var Navbar = ReactBootstrap.Navbar,
    Nav  = ReactBootstrap.Nav,
    NavItem  = ReactBootstrap.NavItem,
    NavDropdown  = ReactBootstrap.NavDropdown,
    MenuItem  = ReactBootstrap.MenuItem,
    ButtonGroup = ReactBootstrap.ButtonGroup,
    Button  = ReactBootstrap.Button,
    Input = ReactBootstrap.Input,
    Table = ReactBootstrap.Table;

function getHostName(){
  var url = window.location.hostname;
  var arr = url.split(":");
  return arr[0];
}


var JobBox = React.createClass({
  loadJobsFromServer: function() {    
  var objFather = this;
    socket.on('job_list', function(msg){
      //console.log(msg);
      objFather.setState({data:msg});
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  handleJobSubmit: function(job){
    var jobs = this.state.data;
    if(jobs ==null || (jobs!=null && jobs.length==0)){
      jobs = this.state[0];      
    }

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
      <ABNavBar />
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
    console.log(this.props.data);
    var jobNodes = this.props.data
    if(jobNodes!=null && jobNodes.length>0){
      var jobNodes = jobNodes[0].hits.hits.map(function(varJob) {

        return (
          <Job title={varJob._source.title} 
          job_type = {varJob._source.job_type} 
          url={varJob._source.angellist_url} 
          key={varJob._id}  
          prop_key={varJob._id}   
          role={varJob._source.role_tag}/>
        );
      });
    }
    return (
      <div className="jobList">
       <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>Code</th>
              <th>Title Job</th>
              <th>Role</th>
              <th>Job Type</th>
              <th>Url</th>
            </tr>
          </thead>
          <tbody>
            {jobNodes}
          </tbody>
        </Table>
      </div>
    );
  }
});

var Job = React.createClass({
  rawMarkup: function() { 
    if(this.props.children!=null){
      var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    }else{
      var rawMarkup = marked(this.toString(), {sanitize: true});
    }
    return { __html: rawMarkup };
  },

  render: function() {
    console.log(this.props);
    return (
      <tr className="job">
        <td>{this.props.prop_key}</td>
        <td>{this.props.title}</td>
        <td>{this.props.role}</td>        
        <td>{this.props.job_type}</td>        
        <td>{this.props.url}</td>
      </tr>       
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
      <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="#">Values:</a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Form pullLeft>
              <Input
                  type="text"
                  placeholder="Country"
                  value={this.state.country}
                  onChange={this.handleCountryChange}
                />
                <Input
                    type="text"
                    placeholder="City"
                    value={this.state.city}
                    onChange={this.handleCityChange}
                  />
                  <Input
                    type="text"
                    placeholder="E-mail"
                    value={this.state.email}
                    onChange={this.handleEmailChange}
                  />
              <Button type="submit">Search</Button>              
            </Navbar.Form>
          </Navbar.Collapse>
      </Navbar>    
    </form>
    );
  }
});


var ABNavBar = React.createClass({
    render: function() {        
        return (<div>
                   <Navbar inverse>
                      <Navbar.Header>
                        <Navbar.Brand>
                          <a href="#">AngelAppBase</a>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                      </Navbar.Header>
                      <Navbar.Collapse>
                        <Nav>
                          <NavItem eventKey={1} href="">Home</NavItem>                         
                        </Nav>
                        <Nav pullRight>
                         
                        </Nav>
                      </Navbar.Collapse>
                    </Navbar>
                </div>);
    }
});


React.render(
<JobBox url="/api/list" />,
document.getElementById('content')
);



//React.render(<MyReactBootstrapButton />, document.getElementById("content"));