import pathlib, re, json, subprocess, concurrent.futures
root = pathlib.Path(__file__).parent
out = root / 'assets'
out.mkdir(exist_ok=True)
items = {}
for path in (root / 'reference').glob('*.txt'):
    for name, url in re.findall(r'const (\w+) = "(https://www.figma.com/api/mcp/asset/[^\"]+)"', path.read_text()):
        items[path.stem + '-' + name] = url
def download(item):
    name, url = item
    target = out / (name + '.' + url.rsplit('.', 1)[1])
    subprocess.run(['curl', '-sS', '-L', '--fail', '-o', str(target), url], check=True)
    if target.stat().st_size == 0:
        raise RuntimeError('Empty asset: ' + name)
    return name, 'assets/' + target.name
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
    manifest = dict(pool.map(download, items.items()))
(out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
print('Downloaded', len(manifest), 'assets')
