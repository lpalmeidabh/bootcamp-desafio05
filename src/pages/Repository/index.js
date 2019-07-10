import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import { Loading, Owner, IssueList, IssueFilter, Actions } from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    filter: 0,
    filters: [
      { state: 'all', label: 'All', active: true },
      { state: 'close', label: 'Closed', active: false },
      { state: 'open', label: 'Opened', active: false },
    ],
    curPage: 1,
    loading: true,
  };

  async componentDidMount() {
    const { filters } = this.state;
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filters.find(filter => filter.active).state,
          per_page: 5,
        },
      }),
    ]);
    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  loadMoreIssues = async () => {
    const { filters, filter, curPage } = this.state;
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[filter].state,
        per_page: 5,
        page: curPage,
      },
    });
    this.setState({
      issues: response.data,
    });
  };

  handleFilterChange = async filter => {
    await this.setState({ filter });
    this.loadMoreIssues();
  };

  handlePageChange = async action => {
    const { curPage } = this.state;

    this.setState({ curPage: action === 'n' ? curPage + 1 : curPage - 1 });
    this.loadMoreIssues();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      filters,
      filter,
      curPage,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <IssueFilter active={filter}>
            {filters.map((item, idx) => (
              <button
                type="button"
                key={filter.label}
                onClick={() => this.handleFilterChange(idx)}
              >
                {item.label}
              </button>
            ))}
          </IssueFilter>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.title}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Actions>
          <button
            type="button"
            disabled={curPage < 2}
            onClick={() => this.handlePageChange('b')}
          >
            Anterior
          </button>
          <span>{curPage}</span>
          <button type="button" onClick={() => this.handlePageChange('n')}>
            Próxima
          </button>
        </Actions>
      </Container>
    );
  }
}
