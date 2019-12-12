import React from 'react';
import { Link } from 'react-router-dom';

import Notification from '~/components/Notifications';

import logo from '~/assets/logo_purple.svg';

import { Container, Profile, Content } from './styles';

export default function Header() {
  return (
    <Container>
      <Content>
        <nav>
          <img src={logo} alt="" />
          <Link to="/dashboard">DASHBOARD</Link>
        </nav>
        <aside>
          <Notification />
          <Profile>
            <div>
              <strong>Lucas Amancio</strong>
              <Link to="/profile">Meu perfio</Link>
            </div>
            <img
              src="https://api.adorable.io/avatars/50/abott@adorable.png"
              alt="Lucas Amancio"
            />
          </Profile>
        </aside>
      </Content>
    </Container>
  );
}
