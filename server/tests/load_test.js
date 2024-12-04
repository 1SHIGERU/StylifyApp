import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';

// Konfiguracja testu
export let options = {
  stages: [
    { duration: '30s', target: 50 }, // Rozgrzewka: 50 użytkowników
    { duration: '1m', target: 500 }, // Wzrost: do 500 użytkowników
    { duration: '2m', target: 1000 }, // Stałe obciążenie: 1000 użytkowników
  ],
};

function login() {
  const payload = JSON.stringify({
    email: 'pat-hur@wp.pl',
    password: 'patryk',
  });

  const headers = { 'Content-Type': 'application/json' };
  const res = http.post('http://localhost:13000/api/auth/login', payload, {
    headers: headers,
  });

  check(res, {
    'Login status was 200': (r) => r.status === 200,
  });

  sleep(1); 
}

function visitMarket() {
  const res = http.get('http://localhost:13000/offers/');
  
  check(res, {
    'Market page status was 200': (r) => r.status === 200,
  });

  sleep(1); // Symulacja czasu oczekiwania
}

export default function () {
  if (__ITER % 2 === 0) {
    login();
  } else {
    visitMarket();
  }
}
