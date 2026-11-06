"""Add the sales mailbox to both website notifications, preserving other options."""
import json
import os
from pathlib import Path
import urllib.request

root = Path(__file__).resolve().parents[1]
env = dict(line.split('=', 1) for line in (root / '.env').read_text().splitlines()
           if '=' in line and not line.startswith('#'))
base = os.environ.get('DIRECTUS_URL', 'http://31.97.9.216:8055').rstrip('/')
token = None


def request(path, data=None, method=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    with urllib.request.urlopen(urllib.request.Request(
        base + path, headers=headers, method=method,
        data=json.dumps(data).encode() if data is not None else None,
    ), timeout=30) as response:
        return json.load(response)['data']


token = request('/auth/login', {
    key: env['ADMIN_' + key.upper()].strip().strip('\"\'')
    for key in ['email', 'password']
})['access_token']
flows = request('/flows?limit=-1')
operations = request('/operations?limit=-1')
target = 'ventas@joseluisjara.cl'
# Resolve both operations before making any changes.
selected = []
for collection in ['mensaje_contacto', 'solicitud_tasacion']:
    flow = next(f for f in flows if f['status'] == 'active' and collection in
                (f.get('options') or {}).get('collections', []))
    operation = next(o for o in operations if o['flow'] == flow['id'] and o['type'] == 'mail')
    selected.append((collection, operation))

for collection, operation in selected:
    options = dict(operation['options'])
    recipients = options['to']
    if isinstance(recipients, str):
        recipients = [address.strip() for address in recipients.split(',') if address.strip()]
    else:
        recipients = list(recipients)
    if target not in [address.lower() for address in recipients]:
        recipients.append(target)
    options['to'] = recipients
    path = '/operations/' + operation['id']
    request(path, {'options': options}, method='PATCH')
    saved = request(path)
    assert saved['options'] == options, 'Saved configuration does not match'
    print(collection + ': verified sales recipient added; original recipients and email design preserved.')
