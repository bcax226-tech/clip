#!/usr/bin/env python3
"""
Fast local transcription using faster-whisper (CTranslate2 backend).

Reads CLI args, streams one JSON object per segment to stdout (NDJSON),
then a final {"done": true, "language": "...", "duration": ...} line.

Usage:
    python3 transcribe_fast.py AUDIO_PATH [--language id|en|auto] [--model base|tiny|small|medium] [--device cpu|cuda]
"""
import argparse
import json
import sys


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("audio")
    parser.add_argument("--language", default="auto")
    parser.add_argument("--model", default="base")
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--compute-type", default="int8")
    args = parser.parse_args()

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(
            json.dumps({"error": "faster-whisper not installed. Run: pip install faster-whisper"}),
            file=sys.stderr,
        )
        return 2

    model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)

    segments, info = model.transcribe(
        args.audio,
        language=None if args.language == "auto" else args.language,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 500},
        beam_size=1,
    )

    for seg in segments:
        out = {
            "start": round(seg.start, 3),
            "end": round(seg.end, 3),
            "text": seg.text.strip(),
        }
        sys.stdout.write(json.dumps(out, ensure_ascii=False) + "\n")
        sys.stdout.flush()

    sys.stdout.write(
        json.dumps({"done": True, "language": info.language, "duration": info.duration}) + "\n"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
