# DeltaT

A self-hosted, open-source time-tracking tool focused on target-vs-actual hours instead of client billing.

> ⚠️ Status: Under active development. Not ready for production use yet.

## Why DeltaT?

Existing open-source time-tracking tools are built for freelancers and companies 
that bill clients. If you just want to know whether you're above or below your contractually
agreed weekly hours (e.g. as a working student with a hourly contract that changes over time),
you get unnecessary overhead and can't even easily set up multiple contract periods with
different weekly hours.

DeltaT does exactly that: track time, set your weekly target hours (across multiple contract
periods), see your balance. Nothing else.

## Features

- [x] Time tracking (manual entries)
- [x] Any number of contracts with a time range and weekly target hours
- [ ] Automatic balance calculation (actual vs. target, cumulative across contract boundaries)
- [ ] Web interface (self-hosted)
- [ ] Android app (later, via F-Droid)

## Tech Stack

- Backend: Python, FastAPI, SQLite (via SQLAlchemy)
- Frontend: Flutter (web first, Android later)
- Deployment: Docker

## Installation

_Coming once a first working version exists._

## License

DeltaT is licensed under [AGPLv3](LICENSE). For companies that want to use the code without
the AGPL copyleft obligations, a commercial license will also be available.
Contact: support@heine-studios.de

## Contributing

Contributions are welcome. Since this project will be dual-licensed, a Contributor License
Agreement (CLA) will be required before larger pull requests are merged. Details to follow.
