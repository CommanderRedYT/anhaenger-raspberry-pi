// use bootstrap
function renderKey(key, value, custom_name) {
    const name = custom_name || key;
    switch (typeof value) {
        case 'number':
            return `<div class="mb-3 row">
                        <label for="input${key}" class="col-sm-2 col-form-label">${key} (${typeof value})</label>
                        <div class="col-sm-10">
                            <input type="number" class="form-control" id="input${key}" value="${value}" name="${name}">
                        </div>
                    </div>
            `;
        case 'boolean':
            return `<div class="mb-3 row">
                        <label for="input${key}" class="col-sm-2 col-form-label">${key} (${typeof value})</label>
                        <div class="col-sm-10">
                            <input type="checkbox" class="form-control" id="input${key}" ${value ? 'checked' : ''} name="${name}">
                        </div>
                    </div>
            `;
        case 'string':
            return `<div class="mb-3 row">
                        <label for="input${key}" class="col-sm-2 col-form-label">${key} (${typeof value})</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="input${key}" value="${value}" name="${name}">
                        </div>
                    </div>
            `;
        case 'object':
            if (value instanceof Array) {
                // for every element, render a new input field;
                let html = `<h5>${key} (${typeof value})</h5>`;
                for (let i = 0; i < value.length; i++) {
                    html += renderKey(`${key}[${i}]`, value[i], `${key}__${i}`);
                }
                return html;
            }
        default:
            // unknown type, return as key: value
            return `<div class="mb-3 row">
                        <label for="input${key}" class="col-sm-2 col-form-label">${key} (${typeof value})</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="input${key}" value="${value}" name="${key}">
                        </div>
                    </div>
            `;
    }
}

export const toHTML = (config, action_url, name) => {
    let html = `<form id="config-form-${name}" action="${action_url}" method="POST">`;
    for (let key in config) {
        html += renderKey(key, config[key]);
    }
    html += `
        <div class="d-grid gap-2 col-6 mx-auto">
            <button type="submit" class="btn btn-success">Submit</button>
            <button type="button" class="btn btn-danger" onclick="document.getElementById('config-form').reset();">Cancel</button>
        </div>
    </form>
    `;
    return html;
}