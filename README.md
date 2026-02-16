# EEBUS-Control 🔌🔋

![EEBUS-Client Web View](assets/img/eebus_client_ss.png)

A robust client implementation for the **EEBUS** protocol, designed to communicate with energy management systems (EMS), electric vehicle supply equipment (EVSE), and other smart home devices.

This project implements the **SHIP** (Smart Home IP) and **SPINE** (Smart Premises Interoperable Neutral-Message Exchange) protocols to enable seamless interoperability within the local energy grid.

## 🚀 Features

*   **SHIP Discovery**: Automatic discovery of EEBUS services via mDNS.
*   **Secure Connection**: TLS-based communication with certificate handling.
*   **SPINE Support**: Parsing and sending of SPINE datagrams for device control and monitoring.
*   **Use Cases**:
    *   EV Charging (EVSE) monitoring.
    *   HVAC / Heat Pump integration.
    *   Grid connection point monitoring.

## 📋 Prerequisites

*   [Go](https://go.dev/dl/) 1.21 or higher (if building from source)
*   Network access to the local multicast group (for mDNS discovery)

## 🛠️ Installation

Clone the repository and build the binary:

```bash
git clone https://github.com/your-username/eebus-client.git
cd eebus-client
go build -o eebus-client cmd/main.go
```

## ⚙️ Configuration

The client requires a configuration file (e.g., `config.json` or `.env`) to define the local SKI (Subject Key Identifier) and certificate paths.

Example `config.json`:

```json
{
  "serverPort": 4711,
  "certificate": "./certs/client.crt",
  "privateKey": "./certs/client.key",
  "remoteSki": "OPTIONAL_REMOTE_DEVICE_SKI"
}
```

> **Note**: On the first run, the client will generate a self-signed certificate if one is not provided.

## 🏃 Usage

Run the client to start discovering devices:

```bash
./eebus-client --config config.json
```

### Pairing

EEBUS requires a pairing process (SHIP handshake).
1.  Start the client.
2.  Approve the connection on the target device (e.g., the Wallbox or HEMS).
3.  Once paired, the client will begin exchanging SPINE data.

## 📚 Documentation

*   **EEBUS Specifications**: https://www.eebus.org/media-downloads/
*   **SHIP Protocol**: Transport layer for secure communication.
*   **SPINE Protocol**: Application layer for data exchange.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1.  Fork the repo.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
