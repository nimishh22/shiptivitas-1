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

const LANE_BY_STATUS = {
  backlog: 'backlog',
  'in-progress': 'inProgress',
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
      moves: el => el.classList.contains('Card'),
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

    const targetLane = Object.keys(this.swimlanes).find(
      key => this.swimlanes[key].current === target
    );
    if (!targetLane) return;

    const movedCardId = String(el.getAttribute('data-id'));

    // Dragula has already updated the DOM at this point. Synchronize the DOM
    // order with React so subsequent renders preserve both sorting and status.
    this.setState(previousState => {
      const allClients = Object.keys(previousState.clients)
        .reduce((items, key) => items.concat(previousState.clients[key]), []);
      const clientsById = {};
      allClients.forEach(client => {
        clientsById[String(client.id)] = client;
      });

      const clients = { backlog: [], inProgress: [], complete: [] };
      const assignedIds = new Set();

      Object.keys(this.swimlanes).forEach(lane => {
        const container = this.swimlanes[lane].current;
        if (!container) return;

        Array.from(container.querySelectorAll('.Card')).forEach(card => {
          const id = String(card.getAttribute('data-id'));
          const client = clientsById[id];
          if (!client || assignedIds.has(id)) return;

          const status = id === movedCardId
            ? STATUS_BY_LANE[targetLane]
            : STATUS_BY_LANE[lane];
          clients[lane].push({ ...client, status });
          assignedIds.add(id);
        });
      });

      // Keep any card not present in the DOM, without losing its existing lane.
      allClients.forEach(client => {
        const id = String(client.id);
        if (assignedIds.has(id)) return;
        const lane = id === movedCardId
          ? targetLane
          : (LANE_BY_STATUS[client.status] || 'backlog');
        clients[lane].push({ ...client, status: STATUS_BY_LANE[lane] });
      });

      return { clients };
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
