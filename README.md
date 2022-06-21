# lbdoc-p

The tool automatically generates documentation for remote method loopback
# Install
```
npm i lbdoc-p
```

# How to use

Create `lbdoc-p.json` file in project folder:

```
{
  "info" : {
    "lang": "en-US",
    "title": "TITLE",
    "description": "DESCRIPTION"
  }
}
```

Create documents:
where `common/models` is the directory containing the .json files of models
```
npx lbdoc-p  create -d common/models
```

Run develop
```
npx lbdoc-p dev
```

Build static html directory
```
npx lbdoc-p build
```