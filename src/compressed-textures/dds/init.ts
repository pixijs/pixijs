import { detectCompressed } from '../../assets/detections/parsers/detectCompressed';
import { extensions } from '../../extensions/Extensions';
import { loadDDS } from './loadDDS';

extensions.add(loadDDS);
extensions.add(detectCompressed);
