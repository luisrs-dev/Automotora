"""Apply a branded email, preserving recipients. Use --form tasacion for appraisals."""
import argparse
import json
import os
from pathlib import Path
import urllib.request
import uuid

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--form', choices=['contacto', 'tasacion'], default='contacto')
args = parser.parse_args()
collection = 'solicitud_tasacion' if args.form == 'tasacion' else 'mensaje_contacto'
env = dict(line.split('=', 1) for line in (root / '.env').read_text().splitlines()
           if '=' in line and not line.startswith('#'))
base = os.environ.get('DIRECTUS_URL', 'http://31.97.9.216:8055').rstrip('/')
token = None


def request(path, data=None, method=None, content_type='application/json', raw=False):
    headers = {'Content-Type': content_type}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    payload = data if raw else json.dumps(data).encode() if data is not None else None
    with urllib.request.urlopen(urllib.request.Request(
        base + path, data=payload, headers=headers, method=method,
    ), timeout=30) as response:
        return json.load(response)['data']


token = request('/auth/login', {key: env['ADMIN_' + key.upper()].strip().strip('\"\'')
                                for key in ['email', 'password']})['access_token']
flow = next(f for f in request('/flows?limit=-1') if collection in
            (f.get('options') or {}).get('collections', []))
operation = next(o for o in request('/operations?limit=-1')
                 if o['flow'] == flow['id'] and o['type'] == 'mail')
files = request('/files?filter[filename_download][_eq]=contact-email-logo.png')
if files:
    logo_id = files[0]['id']
else:
    boundary = 'ContactLogo' + uuid.uuid4().hex
    logo = (root.parent / 'frontend/public/logo-joseluisjara.png').read_bytes()
    body = (f'--{boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\n'
            f'Logo correo contacto\r\n--{boundary}\r\n'
            'Content-Disposition: form-data; name="file"; filename="contact-email-logo.png"\r\n'
            'Content-Type: image/png\r\n\r\n').encode() + logo + f'\r\n--{boundary}--\r\n'.encode()
    logo_id = request('/files', body, content_type='multipart/form-data; boundary=' + boundary,
                      raw=True)['id']
logo_url = base + '/assets/' + logo_id
# Email clients must be able to fetch the image without authentication.
with urllib.request.urlopen(logo_url, timeout=30) as response:
    assert response.headers.get_content_type() == 'image/png'

options = dict(operation['options'])
options.update({
    'type': 'wysiwyg',
    'body': (root / ('templates/' + args.form + '.html')).read_text().replace('__LOGO_URL__', logo_url),
    'replyTo': '{{ $trigger.payload.correo }}',
})
updated = request('/operations/' + operation['id'], {'options': options}, method='PATCH')
assert updated['options'] == options
assert updated['options']['to'] == operation['options']['to']
assert updated['options'].get('subject') == operation['options'].get('subject')
print('Updated ' + args.form + ' email template; verified saved HTML, reply-to, recipient, subject and public logo.')
