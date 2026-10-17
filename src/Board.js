import React from 'react';
import Dragula from 'dragula';
import 'dragula/dist/dragula.css';
import Swimlane from './Swimlane';
import './Board.css';

const STATUS_BY_LANE = {
  backlog: 'backlog',
  inProgress: 'in-progress',
  complete: 'complete',
};

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    const clients = this.getClients();
    this.state = {
      clients: {
        backlog: clients.filter(client => !client.status || client.status === 'backlog'),
        inProgress: clients.filter(client => client.status === 'in-progress'),
        complete: clients.filter(client => client.status === 'complete'),
      },
    };
    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    };
    this.dragula = null;
    this.handleDrop = this.handleDrop.bind(this);
  }

  componentDidMount() {
    const containers = Object.keys(this.swimlanes)
      .map(lane => this.swimlanes[lane].current)
      .filter(Boolean);

    this.dragula = Dragula(containers, {
      moves: (el) => el.classList.contains('Card'),
      accepts: (el, target) => containers.indexOf(target) !== -1,
    });

    this.dragula.on('drop', this.handleDrop);
  }

  componentWillUnmount() {
    if (this.dragula) {
      this.dragula.destroy();
      this.dragula = null;
    }
  }

  handleDrop(el, target) {
    if (!el || !target) return;

    const laneKey = Object.keys(this.swimlanes).find(
      key => this.swimlanes[key].current === target
    );
    if (!laneKey) return;

    const newStatus = STATUS_BY_LANE[laneKey];
    const cardId = el.getAttribute('data-id');

    // Read the DOM order after Dragula finishes moving the card. Updating React
    // state keeps the moved lane, its card color, and subsequent reorders aligned.
    this.setState(previousState => {
      const allClients = Object.keys(previousState.clients)
        .reduce((items, key) => items.concat(previousState.clients[key]), []);
      const movedClient = allClients.find(client => String(client.id) === String(cardId));
      if (!movedClient) return null;

      const clientsByLane = {};
      Object.keys(this.swimlanes).forEach(key => {
        const container = this.swimlanes[key].current;
        const ids = container
          ? Array.from(container.querySelectorAll('.Card')).map(card => card.getAttribute('data-id'))
          : [];
        clientsByLane[key] = ids
          .map(id => allClients.find(client => String(client.id) === String(id)))
          .filter(Boolean)
          .map(client => client.id === movedClient.id
            ? { ...client, status: STATUS_BY_LANE[key] }
            : { ...client, status: STATUS_BY_LANE[key] });
      });

      // Include any cards not found in the lane DOM (for example during a rapid
      // drag/unmount) rather than accidentally dropping them from state.
      const assignedIds = new Set(
        Object.keys(clientsByLane).reduce((ids, key) => ids.concat(clientsByLane[key].map(client => String(client.id))), [])
      );
      allClients.forEach(client => {
        if (!assignedIds.has(String(client.id))) {
          const key = client.id === movedClient.id ? laneKey :
            (Object.keys(this.swimlanes).find(candidate => client.status === STATUS_BY_LANE[candidate]) || 'backlog');
          clientsByLane[key].push({ ...client, status: STATUS_BY_LANE[key] });
        }
      });

      return { clients: clientsByLane };
    });
  }

  getClients() {
    return [
      ['1','Stark, White and Abbott','Cloned Optimal Architecture', 'in-progress'],
      ['2','Wiza LLC','Exclusive Bandwidth-Monitored Implementation', 'complete'],
      ['3','Nolan LLC','Vision-Oriented 4Thgeneration Graphicaluserinterface', 'backlog'],
      ['4','Thompson PLC','Streamlined Regional Knowledgeuser', 'in-progress'],
      ['5','Walker-Williamson','Team-Oriented 6Thgeneration Matrix', 'in-progress'],
      ['6','Boehm and Sons','Automated Systematic Paradigm', 'backlog'],
      ['7','Runolfsson, Hegmann and Block','Integrated Transitional Strategy', 'backlog'],
      ['8','Schumm-Labadie','Operative Heuristic Challenge', 'backlog'],
      ['9','Kohler Group','Re-Contextualized Multi-Tasking Attitude', 'backlog'],
      ['10','Romaguera Inc','Managed Foreground Toolset', 'backlog'],
      ['11','Reilly-King','Future-Proofed Interactive Toolset', 'complete'],
      ['12','Emard, Champlin and Runolfsdottir','Devolved Needs-Based Capability', 'backlog'],
      ['13','Fritsch, Cronin and Wolff','Open-Source 3Rdgeneration Website', 'complete'],
      ['14','Borer LLC','Profit-Focused Incremental Orchestration', 'backlog'],
      ['15','Emmerich-Ankunding','User-Centric Stable Extranet', 'in-progress'],
      ['16','Willms-Abbott','Progressive Bandwidth-Monitored Access', 'in-progress'],
      ['17','Brekke PLC','Intuitive User-Facing Customerloyalty', 'complete'],
      ['18','Bins, Toy and Klocko','Integrated Assymetric Software', 'backlog'],
      ['19','Hodkiewicz-Hayes','Programmable Systematic Securedline', 'backlog'],
      ['20','Murphy, Lang and Ferry','Organized Explicit Access', 'backlog'],
    ].map(companyDetails => ({
      id: companyDetails[0],
      name: companyDetails[1],
      description: companyDetails[2],
      status: companyDetails[3],
    }));
  }

  renderSwimlane(name, clients, ref) {
    return <Swimlane name={name} clients={clients} dragulaRef={ref} />;
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              {this.renderSwimlane('Backlog', this.state.clients.backlog, this.swimlanes.backlog)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('In Progress', this.state.clients.inProgress, this.swimlanes.inProgress)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('Complete', this.state.clients.complete, this.swimlanes.complete)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
