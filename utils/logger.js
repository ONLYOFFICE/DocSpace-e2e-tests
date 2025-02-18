import log from 'loglevel';
import config from '../config/config';

log.setLevel(config.logLevel);

export default log;
