self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Kapyn', body: 'New dispatches available' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/api/icon/192',
      badge: '/api/icon/192',
      tag: 'kapyn-briefing',
      data: { url: data.url ?? '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('kapyn.app') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});
