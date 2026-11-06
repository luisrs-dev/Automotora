"""Configure the contact collection and notification using the existing appraisal setup.

Run from any directory: python3 sistema-gestion/scripts/configure-contact.py
DIRECTUS_URL optionally overrides the frontend's current API URL.
"""
import json
import os
from pathlib import Path
import urllib.request
import urllib.error

env = {}
for line in (Path(__file__).resolve().parents[1] / '.env').read_text().splitlines():
    if '=' in line and not line.startswith('#'):
        key, value = line.split('=', 1)
        env[key] = value.strip().strip('\"\'')
base = os.environ.get('DIRECTUS_URL', 'http://31.97.9.216:8055').rstrip('/')
token = None


def api(path, data=None, method=None, public=False):
    headers = {'Content-Type': 'application/json'}
    if token and not public:
        headers['Authorization'] = 'Bearer ' + token
    request = urllib.request.Request(
        base + path, headers=headers, method=method,
        data=json.dumps(data).encode() if data is not None else None,
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        body = response.read()
        return json.loads(body)['data'] if body else None


token = api('/auth/login', {
    'email': env['ADMIN_EMAIL'], 'password': env['ADMIN_PASSWORD'],
})['access_token']
flows = api('/flows?limit=-1')
source = next(f for f in flows if f['status'] == 'active'
              and 'solicitud_tasacion' in (f.get('options') or {}).get('collections', []))
operations = api('/operations?limit=-1')
mail = next(o for o in operations if o['flow'] == source['id'] and o['type'] == 'mail')
permissions = api('/permissions?limit=-1')
policies = api('/policies?limit=-1')
public_policy = next(p['id'] for p in policies if p['name'] == '$t:public_label')
collection = 'mensaje_contacto'
fields = ['nombre', 'correo', 'celular', 'asunto', 'mensaje']

if collection not in [c['collection'] for c in api('/collections')]:
    api('/collections', {
        'collection': collection,
        'meta': {'icon': 'mail', 'note': 'Mensajes del formulario de contacto del sitio web'},
        'schema': {},
        'fields': [
            {'field': 'id', 'type': 'integer',
             'schema': {'is_primary_key': True, 'has_auto_increment': True},
             'meta': {'hidden': True, 'readonly': True}},
            *[{'field': field, 'type': 'text' if field == 'mensaje' else 'string',
               'schema': {'is_nullable': False},
               'meta': {'interface': 'input-multiline' if field == 'mensaje' else 'input',
                        'required': True, 'width': 'full'}} for field in fields],
            {'field': 'date_created', 'type': 'timestamp',
             'meta': {'special': ['date-created'], 'interface': 'datetime', 'readonly': True}},
        ],
    })
    print('Created mensaje_contacto collection.')

if not any(p['collection'] == collection and p['action'] == 'create'
           and p.get('policy') == public_policy for p in permissions):
    api('/permissions', {
        'policy': public_policy, 'collection': collection, 'action': 'create',
        'fields': fields, 'permissions': {},
        'validation': {'_and': [{field: {'_nempty': True}} for field in fields]},
    })
    print('Enabled public create permission for contact fields only.')

# Check the anonymous request before enabling email notifications; remove only this test.
existing = next((f for f in flows if collection in
                 (f.get('options') or {}).get('collections', [])), None)
if not existing:
    before = api('/items/mensaje_contacto?fields=id&limit=-1')
    api('/items/mensaje_contacto', {
        'nombre': 'Prueba técnica de contacto', 'correo': 'contact-test@example.invalid',
        'celular': '+56900000000', 'asunto': 'Verificación técnica',
        'mensaje': 'Prueba automática de configuración del formulario de contacto.',
    }, public=True)
    after = api('/items/mensaje_contacto?fields=id,correo&limit=-1')
    old_ids = {item['id'] for item in before}
    tests = [item for item in after if item['id'] not in old_ids
             and item['correo'] == 'contact-test@example.invalid']
    assert len(tests) == 1, 'Public submission was not persisted'
    api('/items/mensaje_contacto/' + str(tests[0]['id']), method='DELETE')
    print('Verified anonymous submission and removed the test message.')
    flow = api('/flows', {
        'name': 'Notificación de contacto', 'icon': 'mail', 'status': 'inactive',
        'trigger': 'event', 'accountability': source['accountability'],
        'options': {'type': 'action', 'scope': ['items.create'], 'collections': [collection]},
    })
    options = {
        'type': 'wysiwyg', 'to': mail['options']['to'],
        'subject': 'Nuevo mensaje de contacto — {{ $trigger.payload.asunto }}',
        'body': '<h2>Nuevo mensaje de contacto</h2>' + ''.join(
            '<p><strong>' + field.capitalize() + ':</strong> {{ $trigger.payload.'
            + field + ' }}</p>' for field in fields),
    }
    operation = api('/operations', {
        'name': 'Enviar correo de contacto', 'key': 'enviar_correo_contacto',
        'type': 'mail', 'flow': flow['id'], 'position_x': 0, 'position_y': 0,
        'options': options,
    })
    api('/flows/' + flow['id'], {'operation': operation['id'], 'status': 'active'}, method='PATCH')
    print('Activated contact notification with the appraisal notification recipient.')
else:
    print('Contact flow already exists; preserved its configuration.')

configured = next(f for f in api('/flows?limit=-1') if collection in
                  (f.get('options') or {}).get('collections', []))
assert configured['status'] == 'active' and configured['operation'], 'Contact flow is not active'
try:
    api('/items/mensaje_contacto', public=True)
except urllib.error.HTTPError as error:
    if error.code != 403:
        raise
else:
    raise RuntimeError('Contact messages must not be publicly readable')
print('Verified active notification and denied public access to saved messages.')
print('Contact configuration completed.')
